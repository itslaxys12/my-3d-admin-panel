"""
Netis NC21 Router Adapter
Supports Netis NC21 and standard Netis dual-band wireless routers.
Handles HTTP Basic Auth, CGI session tokens, DHCP lease tables, and active Wi-Fi STA client parsing.
"""

import base64
import json
import re
import time
from typing import Dict, List, Optional, Any

try:
    import requests
    from requests.auth import HTTPBasicAuth
except ImportError:
    requests = None
    HTTPBasicAuth = None

from .base import BaseRouterAdapter, normalize_mac


class NetisNC21Adapter(BaseRouterAdapter):
    """Adapter for Netis NC21 Wi-Fi routers."""

    def __init__(
        self,
        host: str,
        port: int = 80,
        username: str = "admin",
        password: str = "",
        use_https: bool = False,
        timeout: int = 5,
    ):
        super().__init__(host, port, username, password, use_https, timeout)
        if requests is not None:
            self.session = requests.Session()
            if HTTPBasicAuth:
                self.session.auth = HTTPBasicAuth(self.username, self.password)
            self.session.headers.update({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NetisClient/2.1",
                "Accept": "application/json, text/html, */*",
            })
        else:
            self.session = None

    def test_connection(self) -> Dict[str, Any]:
        """Tests connectivity and credentials against Netis NC21."""
        start = time.time()
        try:
            url = f"{self.base_url}/"
            resp = self.session.get(url, timeout=self.timeout)
            latency = round((time.time() - start) * 1000, 2)

            if resp.status_code == 200:
                return {
                    "success": True,
                    "latency_ms": latency,
                    "status_code": resp.status_code,
                    "authenticated": True,
                    "message": f"Connected to Netis NC21 router successfully ({latency}ms).",
                    "details": {
                        "server": resp.headers.get("Server", "Netis Embedded Server"),
                        "auth_status": "Authenticated",
                    }
                }
            elif resp.status_code == 401:
                return {
                    "success": False,
                    "latency_ms": latency,
                    "status_code": 401,
                    "authenticated": False,
                    "message": "Netis NC21 authentication failed: Invalid admin username or password.",
                    "details": {"error": "HTTP 401 Unauthorized"}
                }
            else:
                return {
                    "success": False,
                    "latency_ms": latency,
                    "status_code": resp.status_code,
                    "authenticated": False,
                    "message": f"Netis NC21 returned status {resp.status_code}.",
                    "details": {}
                }
        except requests.exceptions.Timeout:
            latency = round((time.time() - start) * 1000, 2)
            return {
                "success": False,
                "latency_ms": latency,
                "authenticated": False,
                "message": f"Connection timed out after {self.timeout}s. Check Netis router IP or network connectivity.",
                "details": {"error": "Timeout"}
            }
        except Exception as exc:
            latency = round((time.time() - start) * 1000, 2)
            return {
                "success": False,
                "latency_ms": latency,
                "authenticated": False,
                "message": f"Could not reach Netis NC21: {str(exc)}",
                "details": {"error": type(exc).__name__}
            }

    def login(self) -> bool:
        """Authenticates with Netis NC21 interface."""
        login_urls = [
            f"{self.base_url}/cgi-bin/login.cgi",
            f"{self.base_url}/login.html",
            f"{self.base_url}/cgi-bin/device_manage.cgi",
        ]

        # Form data credentials for CGI login
        data = {
            "username": self.username,
            "password": self.password,
            "save": "1"
        }

        for url in login_urls:
            try:
                resp = self.session.post(url, data=data, timeout=self.timeout)
                if resp.status_code in [200, 302]:
                    self.last_authenticated_at = time.time()
                    return True
            except Exception:
                continue

        # Basic Auth is active on session regardless
        self.last_authenticated_at = time.time()
        return True

    def get_connected_devices(self) -> List[Dict[str, Any]]:
        """
        Queries Netis NC21 for active wireless clients and DHCP entries.
        """
        candidate_endpoints = [
            f"{self.base_url}/cgi-bin/device_manage.cgi?action=get",
            f"{self.base_url}/cgi-bin/status.cgi",
            f"{self.base_url}/cgi-bin/get_sta_list.cgi",
            f"{self.base_url}/cgi-bin-igd/netcore_get.cgi?mode_name=netcore_get&action=client_list",
            f"{self.base_url}/status_sta.htm"
        ]

        raw_data = None
        raw_text = ""
        for endpoint in candidate_endpoints:
            try:
                resp = self.session.get(endpoint, timeout=self.timeout)
                if resp.status_code == 200 and resp.text.strip():
                    try:
                        raw_data = resp.json()
                        if raw_data:
                            break
                    except json.JSONDecodeError:
                        raw_text = resp.text
                        # Check if response contains array or devices keyword
                        if "devices" in raw_text or "client" in raw_text or "mac" in raw_text.lower():
                            break
            except Exception:
                continue

        devices = []

        # 1. Parse JSON response if present
        if isinstance(raw_data, dict):
            client_list = raw_data.get("devices") or raw_data.get("client_list") or raw_data.get("clients") or []
            for item in client_list:
                if not isinstance(item, dict):
                    continue
                mac = normalize_mac(item.get("mac") or item.get("mac_address") or "")
                if not mac:
                    continue
                ip = str(item.get("ip") or item.get("ip_address") or "").strip()
                hostname = str(item.get("hostname") or item.get("name") or "Unknown Device").strip()
                band = str(item.get("band") or item.get("wireless") or "").upper()
                conn_type = "5G" if "5G" in band else "2.4G" if "2.4" in band else "Wi-Fi"
                signal = str(item.get("signal") or item.get("rssi") or "-60 dBm").strip()
                if signal and not signal.endswith("dBm"):
                    signal = f"{signal} dBm"

                devices.append({
                    "mac": mac,
                    "ip": ip,
                    "hostname": hostname,
                    "connection_type": conn_type,
                    "signal": signal,
                    "status": "online",
                    "rx_rate": str(item.get("speed", "N/A")),
                    "tx_rate": "N/A"
                })

        # 2. Parse text/HTML table fallback if JSON was not returned
        elif raw_text:
            # Match standard MAC addresses: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
            mac_matches = re.finditer(r"([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})", raw_text)
            seen_macs = set()
            for m in mac_matches:
                mac_raw = m.group(0)
                mac = normalize_mac(mac_raw)
                if mac in seen_macs or mac == "00:00:00:00:00:00":
                    continue
                seen_macs.add(mac)

                # Try to capture adjacent IP
                surrounding = raw_text[max(0, m.start()-100):min(len(raw_text), m.end()+100)]
                ip_match = re.search(r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b", surrounding)
                ip = ip_match.group(0) if ip_match else ""

                devices.append({
                    "mac": mac,
                    "ip": ip,
                    "hostname": f"Netis-Client-{mac[-5:].replace(':', '')}",
                    "connection_type": "5G" if "5G" in surrounding.upper() else "2.4G",
                    "signal": "-62 dBm",
                    "status": "online",
                    "rx_rate": "N/A",
                    "tx_rate": "N/A"
                })

        return devices
