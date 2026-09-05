# -*- coding: utf-8 -*-
"""
GMX Local Router Agent (Wi-Fi Bridge)
Runs on your local PC connected to your home Netis NC21 / Tenda router.
Continuously reads active local network devices and securely synchronizes them 
to your Railway cloud backend and Discord Bot.
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

# ─── Configuration ────────────────────────────────────────────────────────────
API_BASE_URL = os.environ.get("GMX_API_URL", "https://web-production-038e0.up.railway.app")
ROUTER_ID = int(os.environ.get("GMX_ROUTER_ID", "1"))  # Netis NC21 is Router #1
ROUTER_IP = os.environ.get("GMX_ROUTER_IP", "192.168.1.1")
SYNC_INTERVAL = int(os.environ.get("GMX_SYNC_INTERVAL", "30"))  # seconds

OUI_MAP = {
    "30:07:5C": "Netis Technology",
    "00:1A:2B": "Netis Wireless",
    "CC:2D:21": "Tenda Technology",
    "50:2B:73": "Tenda Technology",
    "AC:BC:32": "Apple iPhone",
    "F4:F5:D8": "Apple Device",
    "34:5A:60": "Host PC (Realtek)",
    "B4:CD:27": "Sony Smart TV",
    "D8:3C:69": "Xiaomi / Redmi Phone",
    "5C:C9:99": "Samsung Galaxy Phone",
}

def normalize_mac(mac_raw: str) -> str:
    cleaned = re.sub(r"[^0-9a-fA-F]", "", mac_raw or "").upper()
    if len(cleaned) != 12:
        return ""
    return ":".join(cleaned[i:i+2] for i in range(0, 12, 2))

def get_device_brand(mac: str) -> str:
    prefix = mac[:8]
    return OUI_MAP.get(prefix, "Network Device")

def scan_local_arp_clients() -> list:
    """Reads local network devices from OS ARP table."""
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
                        if ip.startswith("224.") or ip.startswith("239.") or ip.endswith(".255"):
                            continue
                        seen_macs.add(mac)
                        brand = get_device_brand(mac)
                        hostname = f"{brand} ({ip})"
                        if ip == ROUTER_IP:
                            hostname = "Netis NC21 Gateway"
                        devices.append({
                            "mac": mac,
                            "ip": ip,
                            "hostname": hostname,
                            "connection_type": "Wi-Fi",
                            "signal": "-55 dBm",
                            "status": "online"
                        })
    except Exception as exc:
        print(f"[ARP SCAN ERROR] {exc}")

    return devices

def sync_to_cloud(devices: list) -> bool:
    url = f"{API_BASE_URL}/api/routers/{ROUTER_ID}/sync"
    payload = {
        "devices": devices,
        "source": "Local Windows Router Agent"
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "GMX-LocalAgent/1.0"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[SYNC SUCCESS] {data.get('message', 'Devices synced')} ({len(devices)} active clients)")
            if data.get("new_unknown_alerts", 0) > 0:
                print(f"[ALERT] *** {data['new_unknown_alerts']} ROGUE/UNKNOWN DEVICE(S) DETECTED! ***")
            return True
    except urllib.error.HTTPError as he:
        print(f"[SYNC HTTP ERROR] Code {he.code}")
        return False
    except Exception as exc:
        print(f"[SYNC ERROR] Could not reach cloud backend: {exc}")
        return False

def main():
    print("===========================================================")
    print("   GMX HIGH-SECURITY LOCAL ROUTER AGENT (Wi-Fi Radar)      ")
    print("===========================================================")
    print(f"  Target Router ID:  #{ROUTER_ID}")
    print(f"  Router IP:         {ROUTER_IP}")
    print(f"  Cloud Backend URL: {API_BASE_URL}")
    print(f"  Sync Frequency:    Every {SYNC_INTERVAL} seconds")
    print("===========================================================")
    print("Listening on local home network... Press Ctrl+C to stop.\n")

    while True:
        try:
            clients = scan_local_arp_clients()
            print(f"[{time.strftime('%H:%M:%S')}] Detected {len(clients)} local Wi-Fi devices:")
            for c in clients:
                print(f"   - {c['mac']} | {c['ip']:<15} | {c['hostname']}")
            sync_to_cloud(clients)
        except Exception as exc:
            print(f"[AGENT LOOP ERROR] {exc}")

        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    main()
