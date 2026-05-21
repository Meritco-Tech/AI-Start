# Tune Workbench List Minimal Style

## Date

2026-05-20 18:15 CST

## Request Summary

Adjust the workbench list labels and minimal list styling: rename list headings, remove colored dots, use regular-weight row text, and restyle the heading counters.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-tune-workbench-list-minimal-style.md`

## Implementation Notes

- Renamed `数据源清单` to `数据源列表`.
- Renamed `任务清单` to `任务列表`.
- Updated the workbench preview message to use `任务列表` consistently.
- Removed the colored status dots from list rows.
- Changed list item names and status labels to regular font weight.
- Restyled section counters as white chips with a light purple border and regular font weight.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Re-ran the build after aligning the preview message copy.
- Opened `/workbench` in the browser and confirmed the new labels render and the old labels are gone.

## Known Risks

- The workbench list remains UI-only and still uses static demo data.
