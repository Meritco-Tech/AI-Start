# Polish Wallace Report Charts

- Date and local time: 2026-06-03 10:27 CST
- Request summary: Address browser comments to make the top three report panels equal width and improve the regional diagnostic charts.
- Changed files:
  - `src/views/WallaceReportView.vue`
  - `docs/dev-history/README.md`
  - `docs/dev-history/2026-06-03-polish-wallace-report-charts.md`
- Implementation notes:
  - Changed the main report grid to three equal columns so region profit, channel revenue, and monthly trend each take one third of the row.
  - Reworked regional health into a dual-bar comparison for average profit rate and below-national share.
  - Reworked top-bottom profit gap into sorted horizontal bars with TOP20 and gap labels.
  - Reworked regional combo margin into paired bars for pass rate and margin erosion.
- Verification performed:
  - `node --test server/__tests__/*.test.js`
  - `node ./node_modules/vite/bin/vite.js build`
- Known risks or follow-up items:
  - Build still emits the existing Vite large chunk warning.
