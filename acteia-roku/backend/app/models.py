from __future__ import annotations
from pydantic import BaseModel, HttpUrl, Field
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any


class Image(BaseModel):
    url: HttpUrl
    width: Optional[int] = None
    height: Optional[int] = None


class VideoStream(BaseModel):
    url: HttpUrl
    quality: Optional[str] = None
    mime_type: Optional[str] = None
    headers: Optional[Dict[str, str]] = None


class Episode(BaseModel):
    id: str
    title: str
    number: Optional[int] = None
    season: Optional[int] = None
    thumb: Optional[Image] = None


class TitleItem(BaseModel):
    id: str
    slug: str
    title: str
    year: Optional[int] = None
    type: Optional[str] = None  # movie | series | anime | other
    poster: Optional[Image] = None
    backdrop: Optional[Image] = None
    rating: Optional[float] = None


class Section(BaseModel):
    id: str
    title: str
    items: List[TitleItem]


class HomeResponse(BaseModel):
    featured: List[TitleItem] = Field(default_factory=list)
    sections: List[Section] = Field(default_factory=list)
    featured: List[TitleItem]
    sections: List[Section]


class SearchResponse(BaseModel):
    query: str
    items: List[TitleItem] = Field(default_factory=list)
    items: List[TitleItem]


class TitleDetails(BaseModel):
    item: TitleItem
    synopsis: Optional[str] = None
    genres: List[str] = Field(default_factory=list)
    episodes: List[Episode] = Field(default_factory=list)
    extra: Dict[str, Any] = Field(default_factory=dict)
    genres: List[str] = []
    episodes: List[Episode] = []
    extra: Dict[str, Any] = {}


class StreamResponse(BaseModel):
    item_id: str
    streams: List[VideoStream] = Field(default_factory=list)
    streams: List[VideoStream]
