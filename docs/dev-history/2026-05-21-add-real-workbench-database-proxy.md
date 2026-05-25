# 2026-05-21 Add Real Workbench Database Proxy

## Date And Time

2026-05-21 22:44:41 CST

## Request Summary

Moved the workbench MySQL connection into the data-source list and added a development backend implementation for real MySQL connectivity through Vite middleware.

## Changed Files

- `package.json`
- `package-lock.json`
- `vite.config.js`
- `server/workbenchDatabaseMiddleware.js`
- `src/api/workbenchDatabase.js`
- `src/config/workbenchConnections.js`
- `src/views/WorkbenchView.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-21-add-real-workbench-database-proxy.md`

## Implementation Notes

- Added `mysql2` as the server-side MySQL client.
- Added Vite middleware for `/api/v1/workbench/database/*`.
- Implemented connect, table list, table schema, and read-only query endpoints.
- Enforced read-only SQL and limit policy in the backend middleware.
- Passed Vite-loaded environment variables into the middleware so `.env.local` server-only secrets can be read at runtime.
- Moved the configured MySQL source into the workbench `数据源列表`.
- Clicking the MySQL data source now calls the backend connect endpoint and loads real table metadata when credentials are available.
- Kept the real password out of tracked files; the backend reads `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD` from local/server environment variables.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the MySQL connection appears inside `数据源列表`, not as a standalone panel.
- Verified the standalone `.database-connection` entry no longer exists.
- Called `POST /api/v1/workbench/database/connect?connection_id=dev-mysql` and verified the Vite middleware handles the endpoint. The local environment did not include the database password variable, so the endpoint correctly returned the missing-secret error.

## Known Risks Or Follow-Up Items

- Real database connection requires setting `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD` in the local/server environment.
- The current Vite middleware is appropriate for development; production deployment should move the same logic behind the production backend service.
