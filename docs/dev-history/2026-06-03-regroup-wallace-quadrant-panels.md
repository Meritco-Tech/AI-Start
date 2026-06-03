# Regroup Wallace Quadrant Panels

- Date and local time: 2026-06-03 10:31 CST
- Request summary: Change the Wallace combo channel and province quadrant panels so both are grouped by quadrant instead of mixed rows or province-first cards.
- Changed files:
  - `src/views/WallaceReportView.vue`
  - `docs/dev-history/README.md`
  - `docs/dev-history/2026-06-03-regroup-wallace-quadrant-panels.md`
- Implementation notes:
  - Added computed grouping for combo channel rows by quadrant.
  - Reused province quadrant grouping by quadrant so each quadrant card contains multiple provinces.
  - Updated panel titles and grid/card styles to reflect the quadrant-first layout.
- Verification performed:
  - `node --test server/__tests__/*.test.js`
  - `node ./node_modules/vite/bin/vite.js build`
- Known risks or follow-up items:
  - Build still emits the existing Vite large chunk warning.
