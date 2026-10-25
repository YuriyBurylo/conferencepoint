# Vercel deployment from GitHub

The repository root deploys the Vite frontend and Express API as one Vercel project.
`vercel.json` defines installation, the build, API routing, SPA fallback, and dynamic SEO routes.
Use Node.js 24. Docker remains available for local development.

## Connected deployment

- Custom domain: https://conferencepoint.online
- Vercel URL: https://conferencepoint.vercel.app
- Vercel team/project: `science-chums/conferencepoint`
- GitHub production branch: `develop` (pushes deploy automatically)
- PostgreSQL: Neon project `small-dust-65820540`, Frankfurt, separate production/preview branches
- Files: private Vercel Blob stores `conferencepoint-production` and `conferencepoint-preview`
- Credentials are stored as Vercel Secrets and ignored `.env.vercel.*.local` files.

The initial import uses the local June 1, 2026 backup: 2 users, 1 article, 1 upcoming
conference, 7 archived conferences, and 10 files. All 10 files were copied to private
Blob storage and downloaded with matching SHA-256 checksums. A 6 MB direct upload,
article submission, private download, and ZIP export passed. The temporary article
was removed; its private storage verification object is recorded in the ignored
`.vercel/upload-verification.json` file.

The live HOSTIQ data still needs a fresh export. The user requested the domain
switch on October 25, 2026 while that export was unavailable. Restore any later
HOSTIQ export into an isolated empty database, apply migrations, and reconcile it
with Vercel, preserving submissions and accounts created after the DNS switch.
Do not replace the current database blindly. The restore helper deliberately
refuses a populated destination.

Both custom domains are assigned in Vercel, with `www` redirecting to the apex.
The following records were saved in HOSTIQ's authoritative DNS management on
October 25, 2026. Public DNS propagation and Vercel HTTPS validation were pending
immediately after the change:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `0e7dee078ec5d932.vercel-dns-017.com.` |

Mail and TXT records were preserved. The original zone is saved locally in the
ignored `.vercel/hostiq-dns-before-cutover.json` file. Email still points at the
HOSTIQ VPS. Verify HTTPS and the application, reconcile live data, and resolve any
remaining email hosting dependency before shutting down that VPS.

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
