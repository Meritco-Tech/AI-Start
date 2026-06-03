# Hide Wallace Report Table Scrollbar

- Date and local time: 2026-06-02 23:13 CST
- Request summary: Hide the visible scrollbar inside the Wallace report metric table list while preserving internal scrolling.
- Changed files:
  - `src/views/WallaceReportView.vue`
  - `docs/dev-history/README.md`
  - `docs/dev-history/2026-06-02-hide-wallace-report-table-scrollbar.md`
- Implementation notes:
  - Added cross-browser scrollbar hiding rules to `.table-list` with `scrollbar-width: none`, `-ms-overflow-style: none`, and a WebKit scrollbar rule.
  - Kept `overflow: auto` unchanged so the CSV table list remains scrollable.
- Verification performed:
  - `node ./node_modules/vite/bin/vite.js build`
- Known risks or follow-up items:
  - No functional risk expected; this is a scoped visual-only CSS change.
