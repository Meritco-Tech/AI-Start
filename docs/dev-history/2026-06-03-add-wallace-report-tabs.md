# 2026-06-03 Add Wallace Report Tabs

## Summary
- Split the Wallace report module into two switchable tabs: overview and store quadrant analysis.
- Moved month and region selectors into the overview tab header so they no longer appear globally.
- Removed the manual refresh button; overview data still reloads automatically when filters change.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-03-add-wallace-report-tabs.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
