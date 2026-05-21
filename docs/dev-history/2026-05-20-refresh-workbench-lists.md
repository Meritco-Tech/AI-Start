# Refresh Workbench Lists

## Date

2026-05-20 18:08 CST

## Request Summary

Redesign the workbench `数据源清单` and `任务清单` sections so the interface looks cleaner.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-refresh-workbench-lists.md`

## Implementation Notes

- Reworked the left panel lists from boxed cards into lighter row-based lists.
- Added compact section summaries for data-source availability and task stages.
- Added status dots for data sources and tasks.
- Added task progress bars while keeping the page UI-only.
- Reduced repeated borders and heavy badges to make the panel easier to scan.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Opened `/workbench` in the browser and confirmed the refreshed data-source and task list content renders.

## Known Risks

- The redesigned lists still use static demo data and do not connect to real data-source or task APIs.
