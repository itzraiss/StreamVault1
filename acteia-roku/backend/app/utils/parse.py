from __future__ import annotations
from bs4 import BeautifulSoup
from typing import Optional
import re


def text_or_none(node) -> Optional[str]:
    if not node:
        return None
    txt = node.get_text(strip=True)
    return txt or None


def parse_year(text: Optional[str]) -> Optional[int]:
    if not text:
        return None
    m = re.search(r"(19|20)\d{2}", text)
    return int(m.group(0)) if m else None


def parse_float(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    m = re.search(r"\d+(?:[\.,]\d+)?", text)
    if not m:
        return None
    return float(m.group(0).replace(",", "."))