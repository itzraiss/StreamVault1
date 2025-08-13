# Acteia Roku App (Backend + Roku SceneGraph)

This project provides a complete pipeline to adapt the website `https://acteia.ca/br` to Roku TVs without webview support. It consists of:

- Backend (FastAPI + BeautifulSoup): Scrapes and parses the site into structured JSON, with caching and rate limiting.
- Roku App (SceneGraph): A TV-friendly interface that consumes the backend JSON to browse and play content (films, series, anime), including search with `roKeyboardScreen`.

Important: This project is provided as a technical template. Ensure you have written authorization from the content owner and follow the site Terms of Service and robots.txt. Do not bypass authentication, paywalls or DRM. Implement user sign-in if required by the service.

## Structure

- `backend/`: FastAPI server exposing JSON endpoints.
- `roku/`: SceneGraph application consuming the backend.

## Backend

Requirements:
- Python 3.10+

Setup:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env to configure BASE_URL, CORS, CACHE_TTL, etc.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Deploy (Render):
- Use `backend/Dockerfile` or `backend/Procfile` with a Python environment.

Endpoints (non-exhaustive):
- `GET /healthz`
- `GET /api/home`
- `GET /api/sections`
- `GET /api/search?q=...`
- `GET /api/title/{slug}`
- `GET /api/stream/{slug}?episode=...`
- `GET /api/image?url=...&w=...&q=...` (image proxy/resize)

## Roku App

- Edit `roku/source/Config.brs` and set `BASE_URL` to your backend (e.g., `http://192.168.0.10:8000`).
- Enable Developer Mode on Roku, then sideload the `roku/` folder as a zip.

Build (zip):
```bash
cd roku
zip -r ../roku-app.zip *
```

Sideload:
- Visit `http://<ROKU_IP>` in your browser (Developer Mode) and upload `roku-app.zip`.

## Notes
- The scraper is resilient but site changes may require selector updates in `app/scraper/site_acteia.py`.
- Caching and rate limits are enabled. Adjust via `.env`.
- The player uses `Video` node for HLS/MP4.
- Search uses `roKeyboardScreen` integrated with SceneGraph.