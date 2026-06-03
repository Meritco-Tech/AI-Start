# Compact Wallace Regional Diagnostics

- Date and local time: 2026-06-03 10:35 CST
- Request summary: Make the Wallace regional supplemental diagnostics panel more compact.
- Changed files:
  - `src/views/WallaceReportView.vue`
  - `docs/dev-history/README.md`
  - `docs/dev-history/2026-06-03-compact-wallace-regional-diagnostics.md`
- Implementation notes:
  - Reduced regional diagnostic card padding, row height, gap size, caption size, and chart bar height.
  - Adjusted the province/diagnostic split to equal-width columns for a more balanced layout.
  - Kept the three diagnostic dimensions visible and scan-friendly.
- Verification performed:
  - `node --test server/__tests__/*.test.js`
  - `node ./node_modules/vite/bin/vite.js build`
- Known risks or follow-up items:
  - Build still emits the existing Vite large chunk warning.
