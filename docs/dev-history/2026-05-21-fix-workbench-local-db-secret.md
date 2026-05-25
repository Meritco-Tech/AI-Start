# 2026-05-21 Fix Workbench Local DB Secret

## Date And Time

2026-05-21 22:55:49 CST

## Request Summary

Fixed the workbench database connection failure caused by a missing local server-side password environment variable.

## Changed Files

- `.env.local` (ignored local file, not tracked; secret value omitted)
- `server/workbenchDatabaseMiddleware.js`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-21-fix-workbench-local-db-secret.md`

## Implementation Notes

- Added the required `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD` variable to local `.env.local`.
- Kept the real password out of tracked files and out of this history entry.
- Fixed MySQL metadata field aliases so schema, table, column, and foreign-key values map correctly from `information_schema` responses.

## Verification Performed

- Restarted the local Vite dev server so `.env.local` was reloaded.
- Called the connect endpoint and verified it returned MySQL version `8.0.25` and real schema names.
- Called the table-list endpoint and verified it returned real table metadata.
- Clicked the MySQL data source in `/workbench` and verified the UI changed to connected state and displayed real table names.
- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.

## Known Risks Or Follow-Up Items

- `.env.local` is local-only. Other machines and deployments must set `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD` in their own server environment.
