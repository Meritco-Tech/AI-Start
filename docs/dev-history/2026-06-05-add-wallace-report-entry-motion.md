# 2026-06-05 13:36 CST - Add Wallace Report Entry Motion

## Request Summary

Implement entry animations for the Wallace report overview pages, including all-region and selected-zone views, and the store quadrant analysis page.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-05-add-wallace-report-entry-motion.md`

## Implementation Notes

- Added a Vue `Transition` around the report tab content for lightweight tab switching.
- Added row-level entry animation markers for the all-region overview, selected-zone overview, and quadrant analysis views.
- Changed the main motion rhythm from individual card sequencing to row sequencing, so each row fades in from below from top to bottom.
- Kept subtle chart and bar reveal effects aligned to the row timing instead of independent card timing.
- Added `prefers-reduced-motion: reduce` support to disable animations for users who prefer reduced motion.
- Did not introduce an animation library or change existing data/loading behavior.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser stylesheet and DOM check on `http://localhost:5175/wallace-reports` confirmed:
  - Report view content renders.
  - Row-level `report-row-in` animation and reduced-motion rules are loaded.
  - All-region overview rows use delays from heading through diagnostic rows.
  - Selected-zone overview uses 3-column diagnostic row grouping with delays at 300ms and 400ms.
  - Quadrant analysis rows use delays from heading through province quadrant diagnostics.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
