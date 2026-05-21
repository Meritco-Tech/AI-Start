# 2026-05-20 Lighten Workbench Count Tags

## Date And Time

2026-05-20 20:24:26 CST

## Request Summary

Made the count numbers beside the workbench data-source and task list headings smaller and non-bold.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-lighten-workbench-count-tags.md`

## Implementation Notes

- Added explicit typography overrides to `.panel-count.el-tag`.
- Reduced the tag height and horizontal padding.
- Set the count font size to `11px` and font weight to `400`.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified both workbench count tags render with `11px` font size and `400` font weight.

## Known Risks Or Follow-Up Items

- None.
