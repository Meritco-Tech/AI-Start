# 2026-05-28 Set WeCom FatherId To SpaceId

## Date And Time

2026-05-28 22:26:45 CST

## Request Summary

Changed the WeCom file-list request so `fatherid` defaults to the same value as `spaceid`.

## Changed Files

- `server/workbenchWecomMiddleware.js`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-28-set-wecom-fatherid-to-spaceid.md`

## Implementation Notes

- Updated the WeCom file-list request body builder to use `fatherid = fatherId || spaceId`.
- Preserved support for an explicit `father_id` query parameter if it is supplied later.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Restarted the local Vite service and called `/api/v1/workbench/wecom/files?connection_id=wecom-docs`.
- Confirmed the request no longer fails as `space not exist`; WeCom now returns `permision deny`, indicating the request reaches the configured space but the application still lacks required file access permission.

## Known Risks Or Follow-Up Items

- WeCom now rejects the request with `permision deny`; the configured space is being reached, but the application still needs the required file access permission for that space.
