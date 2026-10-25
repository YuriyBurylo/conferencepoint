# Vercel deployment from GitHub

The repository root deploys the Vite frontend and Express API as one Vercel project.
`vercel.json` defines installation, the build, API routing, SPA fallback, and dynamic SEO routes.
Use Node.js 24. Docker remains available for local development.

## Project settings

- Git repository: `YuriyBurylo/conferencepoint`
- Root Directory: repository root (`./`)
- Application Preset: Other
- Install: `npm ci --omit=dev --prefix server && npm ci --include=dev --prefix client`
- Build: `npm run build --prefix client`
- Output: `client/dist`
- Function region: Frankfurt (`fra1`), near the PostgreSQL database
- Production Branch: the branch containing the approved migration changes

Set the variables in `.env.vercel.example` in Vercel. Use a pooled `DATABASE_URL`
for the app and a direct `DATABASE_URL_UNPOOLED` for migration commands. Keep
production and preview databases and Blob stores separate. Never put database
credentials, JWT secrets, or Blob tokens in `VITE_` variables.

Connect a **private** Vercel Blob store and enable `VITE_BLOB_UPLOADS=true` before
building. Authenticated browsers upload files directly to Blob. The API validates
ownership, size, extension, and file signatures before storing references.
Downloads retain the existing authorization checks and stream private files.
Older files stored in PostgreSQL remain readable during migration.

## Move existing data

1. Export a fresh HOSTIQ database with `pg_dump`. Keep the original export private.
2. Restore into an empty managed database. The helper removes local ownership
   statements and preserves an existing administrator's password:

   ```powershell
   $env:PSQL_PATH = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
   node --env-file=.env.vercel.production.local server/scripts/restore-database.js <fresh-backup.sql>
   ```

3. Test migrations on a database branch, then apply them to the migration target:

   ```powershell
   node --env-file=.env.vercel.production.local server/scripts/migrate.js
   node --env-file=.env.vercel.production.local server/scripts/migrate-files-to-blob.js
   ```

   File migration verifies SHA-256 checksums and keeps the original database bytes.
   It can be resumed: rows already holding a Blob reference are skipped.
   Local migration needs a Blob token for that destination store. Alternatively,
   an authenticated administrator can POST `/api/uploads/migrate` on Vercel;
   that uses the deployment's short-lived Blob identity without a static token.

4. Verify conference pages, login, admin editing, article submission, receipts,
   PDF downloads, ZIP export, and direct links after page reload.
5. Pause submissions briefly on HOSTIQ, take the final export, reconcile any
   changes since the test copy, and verify database/file counts.
6. Add `conferencepoint.online` in Vercel Domains and apply the DNS records shown
   there. Keep HOSTIQ available until the new deployment and DNS are verified.

Do not run database migrations in the Vercel build or on each function invocation.
Git pushes trigger Vercel builds after the repository is connected; no separate
GitHub Actions deployment workflow is needed.

## Verification

```powershell
npm test --prefix server
node server/test_blob_storage.js
npm test --prefix client
$env:VITE_BLOB_UPLOADS = 'true'
npm run build --prefix client
```

The existing database dump and `server/.env` must stay outside future Git commits.
Rotate credentials that were previously published in the public repository.
