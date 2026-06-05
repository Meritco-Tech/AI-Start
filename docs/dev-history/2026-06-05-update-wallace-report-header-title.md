# 2026-06-05 14:10 CST - Update Wallace Report Header Title

## Request Summary

Change the Wallace report page header title to a generic enterprise report title and remove the visible database/data-source path under the title.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-05-update-wallace-report-header-title.md`

## Implementation Notes

- Replaced the report header title text from `华莱士经营报表` to `企业经营报表`.
- Removed the header subtitle that displayed the report data source path.
- Removed the now-unused `.report-header p` style block.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- Browser DOM check on `http://localhost:5175/wallace-reports` confirmed:
  - Header title text is `企业经营报表`.
  - Header subtitle count is `0`.
  - Page body no longer contains `120.26.181.139:3306/data_metrics_v2`.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
