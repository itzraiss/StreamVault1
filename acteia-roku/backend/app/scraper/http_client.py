import asyncio
from typing import Optional, Dict, Tuple
import httpx
from loguru import logger
from cachetools import TTLCache
from urllib.parse import urljoin
from .robots import RobotsCache
from ..config import settings


class AsyncHttpClient:
    def __init__(self) -> None:
        self._client: Optional[httpx.AsyncClient] = None
        self._cache: TTLCache[str, Tuple[int, Dict[str, str], bytes]] = TTLCache(
            maxsize=settings.CACHE_MAXSIZE, ttl=settings.CACHE_TTL_SECONDS
        )
        self._robots = RobotsCache()
        self._sem = asyncio.Semaphore(settings.MAX_CONCURRENCY)

    async def startup(self) -> None:
        headers = {"User-Agent": settings.USER_AGENT}
        if settings.AUTH_COOKIE:
            headers["Cookie"] = settings.AUTH_COOKIE
        self._client = httpx.AsyncClient(
            headers=headers,
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
            follow_redirects=True,
        )
        logger.info("AsyncHttpClient started")

    async def shutdown(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            logger.info("AsyncHttpClient closed")

    async def get(self, url: str, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        assert self._client is not None, "Client not started"

        # Robots.txt check (best-effort)
        if settings.RESPECT_ROBOTS:
            if not await self._robots.allowed(url):
                logger.warning(f"Blocked by robots.txt: {url}")
                return httpx.Response(status_code=451, content=b"blocked by robots.txt", request=httpx.Request("GET", url))
        if not await self._robots.allowed(url):
            logger.warning(f"Blocked by robots.txt: {url}")
            return httpx.Response(status_code=451, content=b"blocked by robots.txt", request=httpx.Request("GET", url))

        cache_key = url
        if cache_key in self._cache:
            status, resp_headers, body = self._cache[cache_key]
            logger.debug(f"Cache hit for {url}")
            return httpx.Response(status_code=status, headers=resp_headers, content=body, request=httpx.Request("GET", url))

        async with self._sem:
            logger.debug(f"GET {url}")
            resp = await self._client.get(url, headers=headers)
            if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("text"):
                # Cache only text-like responses
                self._cache[cache_key] = (resp.status_code, dict(resp.headers), resp.content)
            return resp

    def absolute(self, url: str, path: str) -> str:
        return urljoin(url, path)