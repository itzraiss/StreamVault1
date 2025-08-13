import asyncio
from functools import lru_cache
from typing import Dict
from urllib.parse import urlparse, urljoin
import httpx
from loguru import logger


class RobotsCache:
    def __init__(self) -> None:
        self._cache: Dict[str, str] = {}
        self._lock = asyncio.Lock()

    async def _fetch(self, base: str) -> str:
        robots_url = urljoin(base, "/robots.txt")
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(robots_url)
                if resp.status_code == 200:
                    return resp.text
        except Exception as exc:
            logger.debug(f"robots fetch failed for {robots_url}: {exc}")
        return ""

    async def allowed(self, url: str, user_agent: str = "*") -> bool:
        parsed = urlparse(url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        async with self._lock:
            if base not in self._cache:
                self._cache[base] = await self._fetch(base)
            robots_txt = self._cache[base]
        # Very naive parser: disallow if any Disallow path is a prefix of the path
        path = parsed.path or "/"
        for line in robots_txt.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.lower().startswith("user-agent:"):
                # ignore specific agent blocks for simplicity
                continue
            if line.lower().startswith("disallow:"):
                dis = line.split(":", 1)[1].strip()
                if dis and path.startswith(dis):
                    return False
        return True