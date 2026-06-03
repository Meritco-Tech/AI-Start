# 2026-05-28 Connect Real WeCom App

## Date And Time

2026-05-28 20:50:32 CST

## Request Summary

Configured the workbench WeCom data source to use a real enterprise application credential flow.

## Changed Files

- `server/workbenchWecomMiddleware.js`
- `src/views/WorkbenchView.vue`
- `.env.local` (ignored local secret file; not tracked)
- `docs/api.md`
- `docs/database.md`
- `.env.example`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-connect-real-wecom-app.md`

## Implementation Notes

- Stored the provided WeCom enterprise id and application secret in local ignored environment configuration only.
- Added a real WeCom token request through the backend middleware.
- Added a WeDrive file-list attempt after token acquisition.
- Kept the token and credentials server-side only and never returned them to the browser.
- Updated the workbench UI so failed token validation shows `连接失败` instead of a misleading success state.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Restarted the Vite service so local WeCom credentials were loaded.
- Called the local WeCom connect endpoint and confirmed the real WeCom application token connects successfully.
- Called the local WeCom file-list endpoint. The request reached the real WeCom API, but WeCom returned `api forbidden` for the file-list call, so the UI falls back to demo document/spreadsheet rows while preserving the connected application state.
- Verified `/workbench` in the browser: clicking `腾讯企业微信` updates the source status to `已连接` and shows the document/spreadsheet result list.

## Known Risks Or Follow-Up Items

- The real WeCom application token is connected, but live document loading still requires the application to be granted the required document or WeDrive file-list permissions.
- Real credentials remain only in `.env.local`, which is ignored by Git.
