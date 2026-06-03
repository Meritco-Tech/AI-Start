# 2026-05-28 Use Default WeCom Space

## Date And Time

2026-05-28 22:09:22 CST

## Request Summary

Configured the workbench WeCom source to use the known default `spaceid` directly without requiring manual space selection.

## Changed Files

- `server/workbenchWecomMiddleware.js`
- `src/api/workbenchWecom.js`
- `src/views/WorkbenchView.vue`
- `.env.local` (ignored local secret/config file; not tracked)
- `.env.example`
- `docs/api.md`
- `docs/database.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-use-default-wecom-space.md`

## Implementation Notes

- Added `WORKBENCH_WECOM_DEFAULT_SPACE_ID` support.
- Set the local default WeCom space id to the provided value in ignored local environment configuration.
- Updated file loading so `/api/v1/workbench/wecom/files` uses the default space id when no `space_id` is supplied.
- Removed the workbench space selector from the UI so clicking the WeCom data source loads files directly.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Restarted the local Vite service and tested `/api/v1/workbench/wecom/files?connection_id=wecom-docs` without a `space_id`; the backend used default space id `155`, and WeCom returned `space not exist`.
- Verified `/workbench` in the browser: clicking `腾讯企业微信` no longer shows a space selector and continues to load the fallback document/spreadsheet result list.

## Known Risks Or Follow-Up Items

- WeCom currently rejects default space id `155` with `space not exist`; the value may not be the microdisk `spaceid` expected by the WeDrive file-list API, or the application may not have access to that space.
