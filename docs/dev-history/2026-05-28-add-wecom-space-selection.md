# 2026-05-28 Add WeCom Space Selection

## Date And Time

2026-05-28 21:54:00 CST

## Request Summary

Changed the workbench WeCom flow to load spaces first, then list files for the selected space.

## Changed Files

- `server/workbenchWecomMiddleware.js`
- `src/api/workbenchWecom.js`
- `src/views/WorkbenchView.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-add-wecom-space-selection.md`

## Implementation Notes

- Added a `/api/v1/workbench/wecom/spaces` backend endpoint.
- Added a WeCom space selector to the workbench result panel.
- Updated file loading to pass `space_id` to the WeCom file-list endpoint.
- Added `WORKBENCH_WECOM_SPACES` support for configured spaces because WeCom file listing requires a known `spaceid`.
- Kept demo fallback metadata when the real space or file-list endpoint is unavailable.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Restarted the local Vite service and tested `/api/v1/workbench/wecom/spaces?connection_id=wecom-docs`; the real token connects, but no usable enterprise space-list response is exposed, so the endpoint returns the configured/demo fallback with a clear message.
- Verified `/workbench` in the browser: clicking `腾讯企业微信` shows the space selector and loads the document/spreadsheet result list.

## Known Risks Or Follow-Up Items

- The exact WeCom space-list endpoint availability depends on enterprise WeDrive API permissions; if the endpoint is unavailable, a real `spaceid` may still need to be configured or provided by an admin.
