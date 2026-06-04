# 2026-06-04 Redesign Wallace Focused Diagnostic Visuals

## Summary
- Replaced the single-region customer structure card with a customer portrait donut, segmented contribution bars, and compact insight chips.
- Replaced the single-region cost/channel margin card with a triangular channel-margin radar and food-cost pressure meter.
- Replaced the single-region store head-tail gap card with top/bottom profit comparison columns and a repair-space meter.
- Preserved the all-region overview list presentation.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-04-redesign-wallace-focused-diagnostic-visuals.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser check: confirmed the all-region overview still shows list rows, and a selected region renders the customer portrait donut, channel-margin radar, and head-tail comparison visuals.
