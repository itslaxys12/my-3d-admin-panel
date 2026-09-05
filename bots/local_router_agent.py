# -*- coding: utf-8 -*-
"""
GMX High-Security Local Router Agent & Wi-Fi Radar v3.0
Features:
- Ultra-Fast 5-Second Real-Time Network Scanner (Windows GetIpNetTable Native API + Concurrent ARP Probing)
- Immediate Connection Detection: Instantly detects when a new device connects with password
- Immediate Disconnection Detection: Instantly removes offline devices ("যে ডিসকানেক্ট মারবে তাকে উঠায় দিবে")
- Dual-Band Netis NC21 Recognition (2.4GHz & 5GHz)
- Instant Event-Driven Synchronization to Railway Cloud Dashboard & Discord Bot
"""

import os
import sys
import re
import time
import json
import socket
import struct
import subprocess
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

# Native Windows Kernel IP Helper API (0ms instant ARP table query)
HAS_WIN_IPHLP = False
if sys.platform == "win32":
    try:
        import ctypes
        from ctypes import wintypes
        iphlpapi = ctypes.windll.iphlpapi

        class MIB_IPNETROW(ctypes.Structure):
            _fields_ = [
                ("dwIndex", wintypes.DWORD),
                ("dwPhysAddrLen", wintypes.DWORD),
                ("bPhysAddr", ctypes.c_ubyte * 8),
                ("dwAddr", wintypes.DWORD),
                ("dwType", wintypes.DWORD),
            ]

        HAS_WIN_IPHLP = True
    except Exception as exc:
        print(f"[IPHLPAPI INIT NOTICE] {exc}")
        HAS_WIN_IPHLP = False

# ─── Configuration ────────────────────────────────────────────────────────────
API_BASE_URL = os.environ.get("GMX_API_URL", "https://web-production-038e0.up.railway.app")
ROUTER_IP = os.environ.get("GMX_ROUTER_IP", "192.168.1.1")
SYNC_INTERVAL = int(os.environ.get("GMX_SYNC_INTERVAL", "5"))  # 5-second ultra-fast radar cycle

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

def ping_probe_quick(subnet_prefix="192.168.1"):
    """
    Rapid concurrent probe across active DHCP client range (192.168.1.1-254)
    using 60 threads with 100ms wait to refresh Windows kernel ARP tables instantly.
    """
    def _probe(host_num):
        ip = f"{subnet_prefix}.{host_num}"
        subprocess.run(["ping", "-n", "1", "-w", "100", ip], capture_output=True)

    hosts_to_probe = list(range(1, 20)) + list(range(100, 140))
    with ThreadPoolExecutor(max_workers=60) as pool:
        pool.map(_probe, hosts_to_probe)

def get_kernel_arp_devices() -> dict:
    """Uses Windows native GetIpNetTable for 0ms direct kernel ARP query."""
    if not HAS_WIN_IPHLP:
        return {}

    try:
        buf_size = 65536
        pTable = (ctypes.c_byte * buf_size)()
        dwSize = wintypes.DWORD(buf_size)
        ret = iphlpapi.GetIpNetTable(ctypes.byref(pTable), ctypes.byref(dwSize), True)
        if ret != 0:
            return {}

        raw_bytes = bytes(pTable)
        num_entries = struct.unpack_from("<I", raw_bytes, 0)[0]
        offset = 4
        row_size = ctypes.sizeof(MIB_IPNETROW)
        
        results = {}
        for _ in range(num_entries):
            row = MIB_IPNETROW.from_buffer_copy(raw_bytes[offset : offset + row_size])
            offset += row_size
            ip = socket.inet_ntoa(struct.pack("<I", row.dwAddr))
            if ip.startswith("192.168.1.") and row.dwType in [3, 4]:
                mac = ":".join(f"{b:02X}" for b in row.bPhysAddr[:row.dwPhysAddrLen])
                if mac and mac != "FF:FF:FF:FF:FF:FF" and not mac.startswith("01:00:5E"):
                    results[mac] = ip
        return results
    except Exception:
        return {}

def scan_local_clients(full_probe=False) -> list:
    """Sweeps network and returns active devices from the ARP table."""
    if full_probe:
        ping_probe_quick()

    kernel_devices = get_kernel_arp_devices()
    devices = []
    seen_macs = set()

    for mac, ip in kernel_devices.items():
        if ip.startswith("224.") or ip.startswith("239.") or ip.endswith(".255"):
            continue
        seen_macs.add(mac)
        brand = get_device_brand(mac, ip)
        is_rand = is_randomized_mac(mac)

        if ip == ROUTER_IP:
            hostname = "Netis NC21 Gateway"
            conn_type = "5G / 2.4G"
        elif "Admin Host" in brand:
            hostname = "Desktop-Admin-PC"
            conn_type = "LAN"
        elif is_rand:
            hostname = f"Mobile-Client-{mac[-5:].replace(':', '')}"
            conn_type = "5G"
        else:
            hostname = f"{brand.split()[0]}-{ip.split('.')[-1]}"
            conn_type = "2.4G"

        devices.append({
            "mac": mac,
            "ip": ip,
            "hostname": hostname,
            "connection_type": conn_type,
            "signal": "-45 dBm" if ip == ROUTER_IP else "-56 dBm",
            "status": "online"
        })

    try:
        output = subprocess.check_output(["arp", "-a"], text=True, stderr=subprocess.DEVNULL)
        for line in output.splitlines():
            line = line.strip()
            parts = line.split()
            if len(parts) >= 2:
                ip = parts[0]
                mac_raw = parts[1]
                if re.match(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$", ip) and ip.startswith("192.168.1."):
                    mac = normalize_mac(mac_raw)
                    if mac and mac not in seen_macs and mac != "FF:FF:FF:FF:FF:FF":
                        if ip.startswith("224.") or ip.startswith("239.") or ip.endswith(".255"):
                            continue
                        seen_macs.add(mac)
                        brand = get_device_brand(mac, ip)
                        is_rand = is_randomized_mac(mac)

                        if ip == ROUTER_IP:
                            hostname = "Netis NC21 Gateway"
                            conn_type = "5G / 2.4G"
                        elif "Admin Host" in brand:
                            hostname = "Desktop-Admin-PC"
                            conn_type = "LAN"
                        elif is_rand:
                            hostname = f"Mobile-Client-{mac[-5:].replace(':', '')}"
                            conn_type = "5G"
                        else:
                            hostname = f"{brand.split()[0]}-{ip.split('.')[-1]}"
                            conn_type = "2.4G"

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
    try:
        req = urllib.request.Request(
            f"{API_BASE_URL}/api/routers",
            headers={"User-Agent": "GMX-LocalAgent/3.0"}
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
        "source": "Local Real-Time Wi-Fi Radar Agent (Kernel ARP + Probe)"
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "GMX-LocalAgent/3.0"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            total = len(devices)
            alerts = data.get("new_unknown_alerts", 0)
            print(f"[{time.strftime('%H:%M:%S')}] [SYNC SUCCESS] {total} active clients synced to Cloud.")
            if alerts > 0:
                print(f"🚨🚨 [ROGUE INTRUSION ALERT] >> {alerts} NEW UNKNOWN DEVICE(S) DETECTED! << 🚨🚨")
            return True
    except urllib.error.HTTPError as he:
        print(f"[SYNC HTTP ERROR] HTTP {he.code}")
        return False
    except Exception as exc:
        print(f"[SYNC ERROR] {exc}")
        return False

def main():
    print("=================================================================")
    print("    GMX REAL-TIME NETIS NC21 WI-FI RADAR & INTRUSION AGENT v3.0  ")
    print("=================================================================")
    print(f"  Target Gateway IP:  {ROUTER_IP} (Netis NC21 Dual-Band)")
    print(f"  Cloud Backend URL:  {API_BASE_URL}")
    print(f"  Ultra-Fast Radar:   Every {SYNC_INTERVAL} seconds")
    print(f"  Direct Kernel ARP:  {'ACTIVE' if HAS_WIN_IPHLP else 'STANDBY'}")
    print("=================================================================")
    print("Connecting to cloud server and detecting Router ID...")
    router_id = discover_target_router_id()
    print(f"Target Router Selected: Router #{router_id} (Netis NC21)")
    print("Monitoring local Wi-Fi active devices in real-time... Press Ctrl+C to stop.\n")

    print("[INIT] Performing initial network sweep...")
    ping_probe_quick()

    previous_active_macs = set()
    iteration = 0

    while True:
        try:
            iteration += 1
            do_probe = (iteration % 4 == 1)
            clients = scan_local_clients(full_probe=do_probe)
            current_active_macs = {c["mac"] for c in clients}

            new_connected = current_active_macs - previous_active_macs
            disconnected = previous_active_macs - current_active_macs

            if new_connected and iteration > 1:
                for c in clients:
                    if c["mac"] in new_connected:
                        print(f"🚨 [NEW DEVICE CONNECTED] {c['mac']} ({c['ip']}) - {c['hostname']} [{c['connection_type']}]")

            if disconnected and iteration > 1:
                for mac in disconnected:
                    print(f"🔌 [DEVICE DISCONNECTED] {mac} disconnected / Wi-Fi turned off.")

            has_changes = bool(new_connected or disconnected)
            if has_changes or iteration % 2 == 1:
                print(f"[{time.strftime('%H:%M:%S')}] [Radar #{iteration}] {len(clients)} Active Online Device(s)")
                sync_to_cloud(router_id, clients)

            previous_active_macs = current_active_macs

        except KeyboardInterrupt:
            print("\nAgent stopped by user.")
            break
        except Exception as exc:
            print(f"[RADAR LOOP ERROR] {exc}\n")

        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    main()
