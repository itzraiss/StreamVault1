from __future__ import annotations
from fastapi import FastAPI, Depends, Query, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import ORJSONResponse
from typing import List, Optional
from loguru import logger
from slowapi.middleware import SlowAPIMiddleware

from .config import settings
from .models import HomeResponse, Section, SearchResponse, TitleDetails, StreamResponse
from .scraper.http_client import AsyncHttpClient
from .scraper.site_acteia import ActeiaScraper
from .image_proxy import fetch_and_resize_image
from .utils.security import is_public_http_url

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])

app = FastAPI(title="Acteia JSON API", default_response_class=ORJSONResponse)
app.state.http_client = AsyncHttpClient()
app.state.scraper = ActeiaScraper(app.state.http_client)
app.state.limiter = limiter


@app.on_event("startup")
async def on_startup() -> None:
    await app.state.http_client.startup()
    logger.info("App startup completed")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await app.state.http_client.shutdown()
    logger.info("App shutdown completed")


@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request, exc):
    return ORJSONResponse({"detail": "Rate limit exceeded"}, status_code=429)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=512)


@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.get("/api/home", response_model=HomeResponse)
@limiter.limit("20/minute")
async def api_home(request: Request):
    return await app.state.scraper.fetch_home()


@app.get("/api/sections", response_model=List[Section])
@limiter.limit("30/minute")
async def api_sections(request: Request):
    return await app.state.scraper.fetch_sections()


@app.get("/api/search", response_model=SearchResponse)
@limiter.limit("30/minute")
async def api_search(request: Request, q: str = Query(..., min_length=1, max_length=100)):
    items = await app.state.scraper.search(q)
    return SearchResponse(query=q, items=items)


@app.get("/api/title/{slug:path}", response_model=TitleDetails)
@limiter.limit("30/minute")
async def api_title(request: Request, slug: str):
    if not slug:
        raise HTTPException(status_code=400, detail="slug required")
    return await app.state.scraper.fetch_title(slug)


@app.get("/api/stream/{slug:path}", response_model=StreamResponse)
@limiter.limit("30/minute")
async def api_stream(request: Request, slug: str, episode: Optional[str] = None):
    if not slug:
        raise HTTPException(status_code=400, detail="slug required")
    return await app.state.scraper.resolve_stream(slug, episode)


@app.get("/api/image")
@limiter.limit("60/minute")
async def api_image(request: Request, url: str, w: Optional[int] = None, q: int = settings.IMAGE_DEFAULT_QUALITY):
    if not is_public_http_url(url):
        raise HTTPException(status_code=400, detail="invalid url")
    width = min(w or settings.IMAGE_MAX_WIDTH, settings.IMAGE_MAX_WIDTH)
    data = await fetch_and_resize_image(url, width=width, quality=q)
    return Response(content=data, media_type="image/jpeg")