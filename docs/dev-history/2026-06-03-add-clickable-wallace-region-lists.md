# 2026-06-03 Add Clickable Wallace Region Lists

## Summary
- Made the all-region overview lists clickable for region profit, low-price risk, region health, and combo margin pass rate.
- Clicking a province now applies the existing region filter and enters the focused single-region overview.
- Added hover and focus-visible styling for the interactive list rows.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-03-add-clickable-wallace-region-lists.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- Browser check: clicked the first region-profit row and confirmed the page switched to the focused region overview.
