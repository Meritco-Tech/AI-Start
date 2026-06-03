# 2026-05-28 Add WeCom Workbench Source

## Date And Time

2026-05-28 20:35:37 CST

## Request Summary

Added Tencent WeCom as a clickable workbench data source that can load document and spreadsheet entries into the result panel.

## Changed Files

- `src/views/WorkbenchView.vue`
- `src/api/workbenchWecom.js`
- `src/config/workbenchConnections.js`
- `server/workbenchWecomMiddleware.js`
- `vite.config.js`
- `.env.example`
- `docs/api.md`
- `docs/database.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-add-wecom-workbench-source.md`

## Implementation Notes

- Added a Tencent WeCom data-source entry to the workbench list.
- Added frontend API wrappers for WeCom connect and file-list loading.
- Added Vite middleware endpoints for `/api/v1/workbench/wecom/connect` and `/api/v1/workbench/wecom/files`.
- Reused the existing result dataset UI to display WeCom documents and spreadsheets with summary metrics and detail rows.
- Added tracked environment-variable placeholders for future WeCom credentials without storing real secrets.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Restarted the local Vite service and verified `GET /api/v1/workbench/wecom/files?connection_id=wecom-docs` returns document and spreadsheet metadata.
- Verified `/workbench` in the browser: clicking `腾讯企业微信` updates the source status to `已加载` and displays 4 files, including 2 documents and 2 spreadsheets, in the result panel.

## Known Risks Or Follow-Up Items

- Real Tencent WeCom API credentials and endpoint mapping are not yet provided; the middleware returns normalized demo document and spreadsheet metadata until those are configured.
