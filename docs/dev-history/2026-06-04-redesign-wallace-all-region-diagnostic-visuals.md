# 2026-06-04 Redesign Wallace All-Region Diagnostic Visuals

## Summary
- Replaced the all-region customer structure list with a regional customer-structure matrix and stacked audience bars.
- Replaced the all-region cost/channel margin list with a regional heat matrix for food cost and channel margins.
- Replaced the all-region store head-tail gap list with a regional profit-gap band ranking.
- Preserved the selected single-region diagnostic visuals.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-04-redesign-wallace-all-region-diagnostic-visuals.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser check: confirmed the all-region overview renders the customer matrix, cost heat matrix, and profit-gap bands; selected single-region mode still renders the existing donut, radar, and head-tail comparison visuals.
