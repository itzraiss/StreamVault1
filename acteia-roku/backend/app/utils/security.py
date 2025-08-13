from __future__ import annotations
from urllib.parse import urlparse
import ipaddress


def is_public_http_url(url: str) -> bool:
    try:
        p = urlparse(url)
        if p.scheme not in {"http", "https"}:
            return False
        host = p.hostname
        if host is None:
            return False
        # Resolve to IP only if it's a literal IP
        try:
            ip = ipaddress.ip_address(host)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False
        except ValueError:
            # Hostname (not an IP). Allow; further DNS checks omitted in this context.
            pass
        return True
    except Exception:
        return False