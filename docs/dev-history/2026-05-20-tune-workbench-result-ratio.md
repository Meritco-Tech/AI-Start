# 2026-05-20 Tune Workbench Result Ratio

## Date And Time

2026-05-20 18:42:22 CST

## Request Summary

Changed the workbench and execution result width ratio to 1:3 and made the "保存为任务" action smaller to improve the narrow workbench column layout.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-tune-workbench-result-ratio.md`

## Implementation Notes

- Changed the main workbench grid from `4fr 1fr` to `3fr 1fr`, keeping execution results on the left and the workbench on the right.
- Added narrower-column styling for the workbench header, chat body, composer, and save-task action button.
- Reduced the save-task button height, padding, radius, and spacing so it fits better in the compact workbench area.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the main grid uses `3fr 1fr`, with the workbench area approximately one third of the execution result area.
- Verified the smaller "保存为任务" button is visible and has no horizontal overflow in the compact workbench header.

## Known Risks Or Follow-Up Items

- The workbench column remains compact by design. Additional future actions may need icon-only or overflow menu treatment.
