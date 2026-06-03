# 2026-05-28 Update WeCom Space And FatherId

## Date And Time

2026-05-28 22:33:37 CST

## Request Summary

Updated the local WeCom file-list request to use the newly provided value for both `spaceid` and default `fatherid`.

## Changed Files

- `.env.local` (ignored local configuration; not tracked)
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-update-wecom-space-and-fatherid.md`

## Implementation Notes

- Updated the ignored local default WeCom space id.
- No source-code change was required because `fatherid` already defaults to the same value as `spaceid`.

## Verification Performed

- Restarted the local Vite service so the updated ignored environment configuration was loaded.
- Called `/api/v1/workbench/wecom/files?connection_id=wecom-docs`; the backend used the new default value for `spaceid` and, by existing source logic, `fatherid`.
- WeCom returned `permision deny`, which indicates the request reached the configured space but the application still lacks the required file access permission.

## Known Risks Or Follow-Up Items

- WeCom currently rejects the request with `permision deny`; the application still needs file access permission for the configured space.
