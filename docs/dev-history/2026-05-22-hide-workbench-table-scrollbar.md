# 2026-05-22 Hide Workbench Table Scrollbar

## Date And Time

2026-05-22 17:47:48 CST

## Request Summary

Hid the visible scrollbar in the workbench result dataset table list while keeping the list scrollable.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-22-hide-workbench-table-scrollbar.md`

## Implementation Notes

- Changed `.table-list` from a visible thin scrollbar to hidden scrollbar styling.
- Kept `overflow-y: auto` so users can still scroll the table list.
- Hid WebKit scrollbars with `display: none`.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large chunk warning.
- Inspected `/workbench` in the browser and confirmed `.table-list` remains scrollable (`overflow-y: auto`, content height exceeds container height) while `scrollbar-width` is `none`.

## Known Risks Or Follow-Up Items

- Hidden scrollbars reduce visible scroll affordance, but this matches the requested UI treatment.
