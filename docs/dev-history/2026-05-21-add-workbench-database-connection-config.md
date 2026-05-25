# 2026-05-21 Add Workbench Database Connection Config

## Date And Time

2026-05-21 22:31:55 CST

## Request Summary

Added a single MySQL database connection configuration for the workbench and exposed it in the workbench upper-left UI without storing the real database password in tracked frontend files.

## Changed Files

- `src/config/workbenchConnections.js`
- `src/views/WorkbenchView.vue`
- `.env.example`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-21-add-workbench-database-connection-config.md`

## Implementation Notes

- Added `dev-mysql` connection metadata with host, port, username, charset, timeout values, and execution policy.
- Stored only the server-side password environment variable name, not the real password.
- Added `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD` to `.env.example`.
- Added a compact database connection entry at the top-left of the workbench panel.
- The connect action currently displays a placeholder message because real MySQL access must be routed through backend APIs.
- Documented planned workbench database endpoints and backend enforcement requirements in `docs/api.md`.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the workbench upper-left database connection entry displays the configured MySQL name, host, port, read-only tag, and connect button.
- Verified clicking the connect button shows the backend-service placeholder message.

## Known Risks Or Follow-Up Items

- The workbench database connection is UI/config only until backend endpoints are implemented.
- Backend implementation must enforce read-only SQL and limit policies before any real query execution is exposed.
