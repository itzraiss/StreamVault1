from __future__ import annotations
from io import BytesIO
from typing import Optional
from PIL import Image as PILImage
import httpx
from fastapi import HTTPException
from cachetools import LRUCache

_image_cache = LRUCache(maxsize=256)


async def fetch_and_resize_image(url: str, width: Optional[int], quality: int) -> bytes:
    cache_key = f"{url}|{width}|{quality}"
    if cache_key in _image_cache:
        return _image_cache[cache_key]

async def fetch_and_resize_image(url: str, width: Optional[int], quality: int) -> bytes:
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=404, detail="Image not found")
        data = resp.content
    try:
        img = PILImage.open(BytesIO(data)).convert("RGB")
        if width and width > 0 and img.width > width:
            ratio = width / img.width
            height = int(img.height * ratio)
            img = img.resize((width, height))
        out = BytesIO()
        img.save(out, format="JPEG", quality=max(10, min(quality, 95)))
        result = out.getvalue()
        _image_cache[cache_key] = result
        return result
    except Exception:
        _image_cache[cache_key] = data
        return out.getvalue()
    except Exception:
        # Fallback: return original data
        return data