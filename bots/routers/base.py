"""
Base Router Adapter Interface and Utilities
Defines the standard abstract contract for all router adapters (Tenda, Netis, etc.)
and provides MAC normalization and device structure formatting.
"""

from abc import ABC, abstractmethod
import re
import time
from typing import Dict, List, Optional, Any


def normalize_mac(raw_mac: str) -> str:
    """
    Normalizes any MAC address representation into uppercase colon-delimited format.
    Examples:
        'aa:bb:cc:11:22:33' -> 'AA:BB:CC:11:22:33'
        'aa-bb-cc-11-22-33' -> 'AA:BB:CC:11:22:33'
        'aabbcc112233'     -> 'AA:BB:CC:11:22:33'
    """
    if not raw_mac:
        return ""
    
    clean = re.sub(r"[^a-fA-F0-9]", "", str(raw_mac)).upper()
    if len(clean) == 12:
        return ":".join(clean[i:i+2] for i in range(0, 12, 2))
    
    # Fallback to uppercase standard replacement if length doesn't match 12 hex digits
    formatted = str(raw_mac).strip().upper().replace("-", ":")
    return formatted


class BaseRouterAdapter(ABC):
    """Abstract base class for all router brand adapters."""

    def __init__(
        self,
        host: str,
        port: int = 80,
        username: str = "admin",
        password: str = "",
        use_https: bool = False,
        timeout: int = 5,
    ):
        self.host = str(host or "").strip().rstrip("/")
        # Remove any leading http:// or https:// if provided in host
        if self.host.startswith("http://"):
            self.host = self.host[7:]
            use_https = False
        elif self.host.startswith("https://"):
            self.host = self.host[8:]
            use_https = True

        self.port = int(port or (443 if use_https else 80))
        self.username = str(username or "admin").strip()
        self.password = str(password or "")
        self.use_https = bool(use_https)
        self.timeout = max(2, int(timeout or 5))
        self.session_token: Optional[str] = None
        self.last_authenticated_at: float = 0

    @property
    def base_url(self) -> str:
        proto = "https" if self.use_https else "http"
        # Standard ports don't need port suffix
        if (proto == "http" and self.port == 80) or (proto == "https" and self.port == 443):
            return f"{proto}://{self.host}"
        return f"{proto}://{self.host}:{self.port}"

    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        Tests router reachability and admin credentials.
        Returns:
            {
                "success": bool,
                "latency_ms": float,
                "message": str,
                "details": dict
            }
        """
        pass

    @abstractmethod
    def login(self) -> bool:
        """
        Performs authentication against router admin interface.
        Returns True if authorized, False otherwise.
        """
        pass

    @abstractmethod
    def get_connected_devices(self) -> List[Dict[str, Any]]:
        """
        Fetches the active list of connected Wi-Fi and LAN devices.
        Returns a list of standardized device dicts:
            [
                {
                    "mac": "AA:BB:CC:11:22:33",
                    "ip": "192.168.0.105",
                    "hostname": "Samsung-S23",
                    "connection_type": "5G",  # '2.4G', '5G', 'LAN', 'Unknown'
                    "signal": "-54 dBm",
                    "status": "online"
                },
                ...
            ]
        """
        pass
