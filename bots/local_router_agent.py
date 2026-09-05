# -*- coding: utf-8 -*-
"""
GMX High-Security Local Router Agent & Wi-Fi Radar
Continuously discovers all active Wi-Fi and LAN devices on your local router subnet (192.168.1.0/24),
identifies device brands / private MAC addresses, and synchronizes telemetry to your Railway Cloud
dashboard and Discord Bot in real time.
"""

import os
import sys
import re
import time
import json
import socket
import subprocess
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

# ─── Configuration ────────────────────────────────────────────────────────────
API_BASE_URL = os.environ.get("GMX_API_URL", "https://web-production-038e0.up.railway.app")
ROUTER_IP = os.environ.get("GMX_ROUTER_IP", "192.168.1.1")
SYNC_INTERVAL = int(os.environ.get("GMX_SYNC_INTERVAL", "20"))  # Run scan every 20s

# Known OUI vendors
OUI_MAP = {
    "30:07:5C": "Netis Technology (NC21)",
    "00:1A:2B": "Netis Wireless",
    "CC:2D:21": "Tenda Technology",
    "50:2B:73": "Tenda Technology",
    "AC:BC:32": "Apple iPhone",
    "F4:F5:D8": "Apple iPad / Mac",
    "34:5A:60": "Admin Host PC",
    "B4:CD:27": "Sony Smart TV",
    "D8:3C:69": "Xiaomi / Redmi Mobile",
    "5C:C9:99": "Samsung Galaxy Mobile",
    "60:A4:4C": "OnePlus / Oppo Phone",
    "70:4D:7B": "TP-Link Device",
    "D4:6E:0E": "TP-Link Client",
}

def normalize_mac(mac_raw: str) -> str:
    cleaned = re.sub(r"[^0-9a-fA-F]", "", mac_raw or "").upper()
    if len(cleaned) != 12:
        return ""
    return ":".join(cleaned[i:i+2] for i in range(0, 12, 2))

def is_randomized_mac(mac: str) -> bool:
    """Detects if MAC is locally administered (Android/iOS Private Wi-Fi address)."""
    try:
        first_byte = int(mac[:2], 16)
        return bool(first_byte & 0x02)
    except Exception:
        return False

def get_device_brand(mac: str, ip: str) -> str:
    if ip == ROUTER_IP:
        return "Netis NC21 Wi-Fi Gateway"
    
    prefix = mac[:8]
    if prefix in OUI_MAP:
        return OUI_MAP[prefix]
    
    if is_randomized_mac(mac):
        return "Smartphone (Private Wi-Fi MAC)"
    
    return "Wi-Fi Connected Client"

def ping_subnet_sweep(subnet_prefix="192.168.1"):
    """
    Fast concurrent ping sweep across subnet to force all Wi-Fi clients (phones, TVs, PCs)
    to refresh their ARP entries with this machine and the router gateway.
    """
    def _ping(host_num):
        ip = f"{subnet_prefix}.{host_num}"
        subprocess.run(["ping", "-n", "1", "-w", "200", ip], capture_output=True)

    with ThreadPoolExecutor(max_workers=60) as pool:
        pool.map(_ping, range(1, 255))

def scan_local_clients() -> list:
    """Sweeps network and returns active devices from the ARP table."""
    # 1. Sweep to wake up all devices on Wi-Fi
    ping_subnet_sweep()

    # 2. Read ARP table
    devices = []
    try:
        output = subprocess.check_output(["arp", "-a"], text=True, stderr=subprocess.DEVNULL)
        seen_macs = set()
        for line in output.splitlines():
            line = line.strip()
            parts = line.split()
            if len(parts) >= 2:
                ip = parts[0]
                mac_raw = parts[1]
                if re.match(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$", ip):
                    mac = normalize_mac(mac_raw)
                    if mac and mac not in seen_macs and mac != "FF:FF:FF:FF:FF:FF":
                        # Exclude broadcast and multicast
                        if ip.startswith("224.") or ip.startswith("239.") or ip.endswith(".255"):
                            continue
                        seen_macs.add(mac)
                        brand = get_device_brand(mac, ip)
                        is_rand = is_randomized_mac(mac)
                        
                        if ip == ROUTER_IP:
                            hostname = "Netis NC21 Gateway"
                            conn_type = "5G"
                        elif "Admin Host" in brand:
                            hostname = "Desktop-Admin-PC"
                            conn_type = "LAN"
                        elif is_rand:
                            hostname = f"Mobile-Client-{mac[-5:].replace(':', '')}"
                            conn_type = "5G"
                        else:
                            hostname = f"{brand.split()[0]}-{ip.split('.')[-1]}"
                            conn_type = "Wi-Fi"

                        devices.append({
                            "mac": mac,
                            "ip": ip,
                            "hostname": hostname,
                            "connection_type": conn_type,
                            "signal": "-48 dBm" if ip == ROUTER_IP else "-58 dBm",
                            "status": "online"
                        })
    except Exception as exc:
        print(f"[ARP SCAN ERROR] {exc}")

    return devices

def discover_target_router_id() -> int:
    """Discovers active Netis router ID directly from Railway Cloud API."""
    try:
        req = urllib.request.Request(
            f"{API_BASE_URL}/api/routers",
            headers={"User-Agent": "GMX-LocalAgent/2.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            routers = data.get("routers", [])
            for r in routers:
                if "netis" in r.get("brand", "").lower() or "192.168.1." in r.get("ip_address", ""):
                    return r["id"]
            if routers:
                return routers[0]["id"]
    except Exception as exc:
        print(f"[DISCOVERY] Cloud API fallback (using ID 5): {exc}")
    return 5

def sync_to_cloud(router_id: int, devices: list) -> bool:
    url = f"{API_BASE_URL}/api/routers/{router_id}/sync"
    payload = {
        "devices": devices,
        "source": "Local Wi-Fi Radar Agent (Ping Sweep + ARP)"
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "GMX-LocalAgent/2.0"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            total = len(devices)
            alerts = data.get("new_unknown_alerts", 0)
            print(f"[SYNC SUCCESS] {data.get('message', 'Devices synced')} ({total} active clients)")
            if alerts > 0:
                print(f"[ROGUE ALERT] >> {alerts} UNKNOWN DEVICE(S) DETECTED! <<")
            return True
    except urllib.error.HTTPError as he:
        print(f"[SYNC HTTP ERROR] HTTP {he.code}")
        return False
    except Exception as exc:
        print(f"[SYNC ERROR] {exc}")
        return False

def main():
    print("=================================================================")
    print("      GMX HIGH-SECURITY LOCAL ROUTER RADAR & WI-FI BRIDGE       ")
    print("=================================================================")
    print(f"  Target Gateway IP:  {ROUTER_IP}")
    print(f"  Cloud Backend URL:  {API_BASE_URL}")
    print(f"  Auto-Scan Interval: Every {SYNC_INTERVAL} seconds")
    print("=================================================================")
    print("Connecting to cloud server and detecting Router ID...")
    router_id = discover_target_router_id()
    print(f"Target Router Selected: Router #{router_id}")
    print("Monitoring local Wi-Fi active devices... Press Ctrl+C to exit.\n")

    iteration = 0
    while True:
        try:
            iteration += 1
            print(f"[{time.strftime('%H:%M:%S')}] [Scan #{iteration}] Sweeping subnet for active Wi-Fi devices...")
            clients = scan_local_clients()
            print(f"   --> Found {len(clients)} online Wi-Fi device(s):")
            for c in clients:
                mac = c["mac"]
                ip = c["ip"]
                host = c["hostname"]
                print(f"       * {mac} | {ip:<15} | {host}")
            
            # Sync to cloud
            sync_to_cloud(router_id, clients)
            print(f"   --> Next scan in {SYNC_INTERVAL} seconds.\n")
        except KeyboardInterrupt:
            print("\nAgent stopped by user.")
            break
        except Exception as exc:
            print(f"[AGENT LOOP ERROR] {exc}\n")

        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    main()
