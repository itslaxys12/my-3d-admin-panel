"""
Router Adapter Management Package
Exports BaseRouterAdapter, TendaAdapter, NetisNC21Adapter, and security helpers.
"""

from typing import Optional, Dict, Any

from .base import BaseRouterAdapter, normalize_mac
from .tenda import TendaAdapter
from .netis import NetisNC21Adapter
from .security import encrypt_password, decrypt_password, sanitize_router_dict


def get_router_adapter(router: Dict[str, Any], timeout: int = 5) -> Optional[BaseRouterAdapter]:
    """
    Factory helper to instantiate the appropriate adapter for a given router dictionary.
    """
    brand = str(router.get("brand") or "").strip().lower()
    host = router.get("ip_address") or router.get("host") or ""
    port = router.get("port") or 80
    username = router.get("username") or "admin"
    
    # Decrypt password if it was loaded from DB
    raw_pass = router.get("password") or ""
    if not raw_pass and router.get("password_encrypted"):
        raw_pass = decrypt_password(router["password_encrypted"])

    use_https = bool(router.get("use_https"))

    if "tenda" in brand:
        return TendaAdapter(
            host=host,
            port=port,
            username=username,
            password=raw_pass,
            use_https=use_https,
            timeout=timeout,
        )
    elif "netis" in brand:
        return NetisNC21Adapter(
            host=host,
            port=port,
            username=username,
            password=raw_pass,
            use_https=use_https,
            timeout=timeout,
        )

    # Fallback to Tenda adapter if brand unknown or generic
    return TendaAdapter(
        host=host,
        port=port,
        username=username,
        password=raw_pass,
        use_https=use_https,
        timeout=timeout,
    )


__all__ = [
    "BaseRouterAdapter",
    "TendaAdapter",
    "NetisNC21Adapter",
    "get_router_adapter",
    "normalize_mac",
    "encrypt_password",
    "decrypt_password",
    "sanitize_router_dict",
]
