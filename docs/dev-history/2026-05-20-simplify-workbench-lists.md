# Simplify Workbench Lists

## Date

2026-05-20 18:11 CST

## Request Summary

Simplify the workbench `数据源清单` and `任务清单` because the previous redesign added more visible information than desired.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-simplify-workbench-lists.md`

## Implementation Notes

- Removed section summary counters.
- Removed secondary descriptions, timestamps, task owners, and task progress bars from the visible list rows.
- Kept each row to a status dot, item name, and concise status label.
- Reduced row height and badge styling for a quieter list appearance.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Opened `/workbench` in the browser and confirmed the simplified list content renders while the previous extra summary/progress text is gone.

## Known Risks

- The workbench lists are intentionally minimal and may need richer metadata again when real data-source and task logic is connected.
