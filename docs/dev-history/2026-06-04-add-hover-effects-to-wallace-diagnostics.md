# 2026-06-04 Add Hover Effects To Wallace Diagnostics

## Summary
- Added the shared interactive-row hover behavior to all-region customer-structure matrix rows.
- Added the shared interactive-row hover behavior to all-region cost/channel margin heat-matrix rows.
- Added hover transitions for customer stacked bars and heat cells.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-04-add-hover-effects-to-wallace-diagnostics.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser check: confirmed customer and cost rows use the shared interactive row class, and their stacked bars / heat cells have hover transitions.
