# Backend (FastAPI) - Deployment

## Local

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Render
Use the provided Dockerfile or Procfile.

## Hugging Face Spaces (Docker)

1) Create a new Space: Type = Docker
2) Push contents of `backend/` to the Space root
3) Ensure `Dockerfile` is present (already configured for `$PORT`)
4) Set Environment variables in the Space Settings:
   - `BASE_URL=https://acteia.ca/br`
   - `CORS_ALLOW_ORIGINS=*`
   - `CACHE_TTL_SECONDS=600`
   - `CACHE_MAXSIZE=2048`
   - `RATE_LIMIT=60/minute`
   - `IMAGE_MAX_WIDTH=720`
   - `IMAGE_DEFAULT_QUALITY=78`
   - `AUTH_COOKIE=...` (se necessário)
5) Build will run and the app will listen on `$PORT` (default 7860)
6) Test endpoint: `https://<your-space>.hf.space/healthz`

Notes:
- Spaces free tier may sleep; enable persistent hardware if needed.
- Respect robots.txt and Terms of Service.