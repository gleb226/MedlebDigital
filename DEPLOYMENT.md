# Docker deployment

1. Copy `.env.production.example` to `.env.production` and replace every example value.
2. On the server, run `docker compose up -d --build`.
3. The application is available on port `3000`. Configure a reverse proxy with HTTPS for the public domain.

For each update:

```bash
git pull
docker compose up -d --build
```
