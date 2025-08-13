from __future__ import annotations
import re
from typing import List, Optional
from bs4 import BeautifulSoup
from loguru import logger
from ..config import settings
from ..models import TitleItem, HomeResponse, Section, Image, TitleDetails, Episode, StreamResponse, VideoStream
from .http_client import AsyncHttpClient
from ..utils.parse import text_or_none, parse_year, parse_float


class ActeiaScraper:
    def __init__(self, http: AsyncHttpClient) -> None:
        self.http = http
        self.base_url = str(settings.BASE_URL)

    async def fetch_home(self) -> HomeResponse:
        resp = await self.http.get(self.base_url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        featured: List[TitleItem] = self._extract_featured(soup)
        sections: List[Section] = self._extract_sections(soup)

        return HomeResponse(featured=featured, sections=sections)

    async def fetch_sections(self) -> List[Section]:
        resp = await self.http.get(self.base_url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        return self._extract_sections(soup)

    async def search(self, query: str) -> List[TitleItem]:
        # Try common WordPress query param ?s= or /search/
        search_urls = [
            f"{self.base_url}?s={query}",
            f"{self.base_url.rstrip('/')}/search/{query}",
        ]
        items: List[TitleItem] = []
        for url in search_urls:
            try:
                resp = await self.http.get(url)
                if resp.status_code != 200:
                    continue
                soup = BeautifulSoup(resp.text, "lxml")
                items = self._extract_grid_items(soup)
                if items:
                    break
            except Exception as exc:
                logger.warning(f"search attempt failed for {url}: {exc}")
        return items

    async def fetch_title(self, slug: str) -> TitleDetails:
        url = self.http.absolute(self.base_url, slug)
        resp = await self.http.get(url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        title_el = soup.select_one("h1, h2.entry-title, .title, .post-title")
        title = text_or_none(title_el) or slug
        synopsis = text_or_none(soup.select_one(".synopsis, .description, .entry-content p"))
        poster_url = self._first_url([
            img.get("src") for img in soup.select(".poster img, .thumb img, .entry-content img, img")
        ])
        poster_abs = self._abs(poster_url) if poster_url else None
        poster = Image(url=poster_abs) if poster_abs else None
        year = parse_year(soup.get_text(" "))
        rating = parse_float(soup.get_text(" "))
        item = TitleItem(id=slug, slug=slug, title=title, year=year, poster=poster, rating=rating)

        episodes = self._extract_episodes(soup)
        genres = [a.get_text(strip=True) for a in soup.select(".genres a, .tags a, a[rel='tag']") if a.get_text(strip=True)]

        return TitleDetails(item=item, synopsis=synopsis, genres=genres, episodes=episodes)

    async def resolve_stream(self, slug: str, episode_id: Optional[str] = None) -> StreamResponse:
        url = self.http.absolute(self.base_url, slug)
        resp = await self.http.get(url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        streams: List[VideoStream] = []

        # Common patterns: <source src="...m3u8">, data attributes, or embeds
        for source in soup.select("video source[src], source[src]"):
            src = source.get("src")
            if src and (".m3u8" in src or ".mp4" in src):
                streams.append(VideoStream(url=self._abs(src), mime_type=source.get("type")))

        # Look for m3u8 in scripts
        if not streams:
            m = re.search(r"https?://[^'\"]+\.(?:m3u8|mp4)", soup.get_text(" "))
            if m:
                streams.append(VideoStream(url=self._abs(m.group(0))))

        # If episode-specific pages exist, attempt to follow links
        if episode_id:
            ep_link = soup.select_one(f"a[href*='{episode_id}']")
            if ep_link:
                ep_url = self._abs(ep_link.get("href"))
                ep_resp = await self.http.get(ep_url)
                if ep_resp.status_code == 200:
                    ep_soup = BeautifulSoup(ep_resp.text, "lxml")
                    m = re.search(r"https?://[^'\"]+\.(?:m3u8|mp4)", ep_soup.get_text(" "))
                    if m:
                        streams = [VideoStream(url=self._abs(m.group(0)))]

        return StreamResponse(item_id=slug, streams=streams)

    # ----------------------------
    # Internal helpers
    # ----------------------------

    def _extract_featured(self, soup: BeautifulSoup) -> List[TitleItem]:
        featured: List[TitleItem] = []
        for a in soup.select(".featured a[href], .slider a[href], .carousel a[href], a.featured")[:60]:
            href = a.get("href")
            if not href:
                continue
            title = (a.get("title") or text_or_none(a)).strip() if (a.get("title") or text_or_none(a)) else href
            img = a.select_one("img")
            poster_url = self._first_url([img.get("data-src") if img else None, img.get("src") if img else None])
            item = TitleItem(id=self._slug(href), slug=self._slug(href), title=title)
            if poster_url:
                item.poster = Image(url=self._abs(poster_url))
            featured.append(item)
        # Deduplicate by slug
        uniq = {}
        for it in featured:
            if it.slug not in uniq:
                uniq[it.slug] = it
        return list(uniq.values())[:20]

    def _extract_sections(self, soup: BeautifulSoup) -> List[Section]:
        sections: List[Section] = []
        # Try containers with headings and grids
        containers = soup.select("section, .section, .block, .home-section, .module")[:20]
        for cont in containers:
            heading = text_or_none(cont.select_one("h2, h3, .section-title, .widget-title"))
            if not heading:
                continue
            items = self._extract_grid_items(cont)
            if items:
                sections.append(Section(id=self._slug(heading), title=heading, items=items[:30]))
        # Fallback: top-level grids
        if not sections:
            items = self._extract_grid_items(soup)
            if items:
                sections.append(Section(id="all", title="Conteúdo", items=items[:60]))
        return sections

    def _extract_grid_items(self, root: BeautifulSoup) -> List[TitleItem]:
        items: List[TitleItem] = []
        for a in root.select("a[href][title], .item a[href], .poster a[href], .thumb a[href], a.poster, a.item")[:300]:
            href = a.get("href")
            if not href:
                continue
            title = a.get("title") or text_or_none(a) or href
            img = a.select_one("img")
            poster_url = self._first_url([
                img.get("data-src") if img else None,
                img.get("srcset") if img else None,
                img.get("src") if img else None,
            ])
            item = TitleItem(id=self._slug(href), slug=self._slug(href), title=title)
            if poster_url:
                item.poster = Image(url=self._abs(self._pick_from_srcset(poster_url)))
            items.append(item)
        # Deduplicate by slug
        uniq = {}
        for it in items:
            if it.slug not in uniq:
                uniq[it.slug] = it
        return list(uniq.values())

    def _extract_episodes(self, soup: BeautifulSoup) -> List[Episode]:
        episodes: List[Episode] = []
        # Try common lists
        for li in soup.select(".episodes li, .episode-list li, ul.episodes li, .ep_list li, a.episode"):
            a = li.select_one("a") if li.name == "li" else li
            if not a:
                continue
            title = text_or_none(a) or a.get("title") or "Episódio"
            href = a.get("href") or ""
            num = None
            m = re.search(r"(?:Epis[oó]dio|Ep)\s*(\d+)", title, flags=re.I)
            if m:
                try:
                    num = int(m.group(1))
                except Exception:
                    pass
            episodes.append(Episode(id=self._slug(href) or title, title=title, number=num))
        return episodes

    def _slug(self, href: str) -> str:
        try:
            slug = re.sub(r"https?://[^/]+", "", href)
            slug = slug.strip("/")
            return slug or "root"
        except Exception:
            return href

    def _abs(self, url: Optional[str]) -> str:
        if not url:
            return ""
        if url.startswith("http"):
            return url
        return self.http.absolute(self.base_url, url)

    def _first_url(self, urls: List[Optional[str]]) -> Optional[str]:
        for u in urls:
            if u and isinstance(u, str):
                return u
        return None

    def _pick_from_srcset(self, src: str) -> str:
        # Pick first URL from srcset or return src itself
        if "," in src:
            return src.split(",")[0].split()[0]
        return src