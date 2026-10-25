# Docker

Run the full stack locally:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

Services:

- `frontend`: nginx on port `8080`, serves the React build and proxies API calls.
- `backend`: Express API on internal port `3000`, runs migrations before startup.
- `db`: PostgreSQL 16 with schema initialized from `server/database.sql`.

Optional custom environment:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

For real production, replace `JWT_SECRET`, database password, `SITE_URL`, and run behind HTTPS.

Reset the admin password:

```bash
docker compose exec -e ADMIN_PASSWORD='new-password-123' backend npm run admin:reset-password -- --email burylojunior@gmail.com
```
