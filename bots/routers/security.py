"""
Router Credential Security & Encryption Module
Provides symmetric encryption for stored router admin passwords so plain text
passwords are never saved in SQLite, and provides strict data redaction utilities.
"""

import base64
import hashlib
import hmac
import os
from typing import Dict, Any, Optional

# Secret key resolution
DEFAULT_FALLBACK_KEY = "GMX-Cyber-Router-Master-Key-2026-X99"

def _get_master_key() -> bytes:
    raw_key = os.getenv("ROUTER_SECRET_KEY") or os.getenv("APP_SECRET") or DEFAULT_FALLBACK_KEY
    return hashlib.sha256(raw_key.encode("utf-8")).digest()


def encrypt_password(plain_text: str) -> str:
    """
    Encrypts a plain text password using Fernet (if available) or an authenticated
    PBKDF2-HMAC-SHA256 cipher fallback.
    """
    if not plain_text:
        return ""

    try:
        from cryptography.fernet import Fernet
        key_32 = _get_master_key()
        fernet_key = base64.urlsafe_b64encode(key_32)
        f = Fernet(fernet_key)
        return "fn:" + f.encrypt(plain_text.encode("utf-8")).decode("utf-8")
    except Exception:
        pass

    # High-security authenticated XOR-Stream cipher fallback
    key = _get_master_key()
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", key, salt, iterations=100000, dklen=len(plain_text.encode("utf-8")))
    raw_bytes = plain_text.encode("utf-8")
    cipher_bytes = bytes([b ^ d for b, d in zip(raw_bytes, derived)])
    
    # Generate HMAC tag for integrity
    tag = hmac.new(key, salt + cipher_bytes, hashlib.sha256).digest()[:16]
    payload = salt + tag + cipher_bytes
    return "enc:" + base64.b64encode(payload).decode("utf-8")


def decrypt_password(cipher_text: str) -> str:
    """
    Decrypts an encrypted password string.
    """
    if not cipher_text:
        return ""

    # Fernet format
    if cipher_text.startswith("fn:"):
        raw_token = cipher_text[3:]
        try:
            from cryptography.fernet import Fernet
            key_32 = _get_master_key()
            fernet_key = base64.urlsafe_b64encode(key_32)
            f = Fernet(fernet_key)
            return f.decrypt(raw_token.encode("utf-8")).decode("utf-8")
        except Exception as e:
            return ""

    # Custom authenticated stream cipher
    if cipher_text.startswith("enc:"):
        try:
            payload = base64.b64decode(cipher_text[4:])
            if len(payload) < 32:
                return ""
            salt = payload[:16]
            tag = payload[16:32]
            cipher_bytes = payload[32:]
            key = _get_master_key()
            
            # Verify HMAC tag
            expected_tag = hmac.new(key, salt + cipher_bytes, hashlib.sha256).digest()[:16]
            if not hmac.compare_digest(tag, expected_tag):
                return ""

            derived = hashlib.pbkdf2_hmac("sha256", key, salt, iterations=100000, dklen=len(cipher_bytes))
            plain_bytes = bytes([c ^ d for c, d in zip(cipher_bytes, derived)])
            return plain_bytes.decode("utf-8")
        except Exception:
            return ""

    # Fallback if stored in plain text during testing
    return cipher_text


def sanitize_router_dict(router: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns a copy of the router dictionary with passwords and sensitive secrets redacted.
    """
    cleaned = dict(router)
    if "password" in cleaned:
        cleaned["password"] = "******" if cleaned["password"] else ""
    if "password_encrypted" in cleaned:
        cleaned["has_password"] = bool(cleaned["password_encrypted"])
        del cleaned["password_encrypted"]
    return cleaned
