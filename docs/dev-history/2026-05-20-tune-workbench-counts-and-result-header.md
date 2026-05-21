# 2026-05-20 Tune Workbench Counts And Result Header

## Date And Time

2026-05-20 18:54:53 CST

## Request Summary

Aligned the workbench data-source and task count badges with the session page count style, and removed the right-side button/icon from the execution result header.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-tune-workbench-counts-and-result-header.md`

## Implementation Notes

- Replaced the custom count badges beside "数据源列表" and "任务列表" with Element Plus plain small tags, matching the session page file-count style.
- Removed the execution result header's right-side icon and its unused icon import.
- Removed the now-unused result header icon CSS.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the data-source and task counts render as Element Plus small plain tags.
- Verified the execution result header no longer renders a right-side icon.

## Known Risks Or Follow-Up Items

- None for the UI-only change.
