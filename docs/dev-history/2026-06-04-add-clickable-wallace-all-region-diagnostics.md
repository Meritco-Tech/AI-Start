# 2026-06-04 Add Clickable Wallace All-Region Diagnostics

## Summary
- Made all-region customer-structure matrix rows clickable so selecting a region opens the focused single-region overview.
- Made all-region cost/channel margin heat-matrix rows clickable with the same focused-region navigation.
- Centered the customer-structure legend and cost heat-matrix note chips.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-04-add-clickable-wallace-all-region-diagnostics.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser check: confirmed customer matrix rows and cost heat-matrix rows navigate to focused region overviews, and both legend areas are centered.
