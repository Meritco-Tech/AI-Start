# 2026-05-21 Shrink Workbench Source Subtext

## Date And Time

2026-05-21 23:29:27 CST

## Request Summary

Made the workbench data-source row secondary text smaller, including the MySQL host and port text.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-21-shrink-workbench-source-subtext.md`

## Implementation Notes

- Added a dedicated `.row-main span` style for source-row secondary text.
- Set the secondary text to `11px`, lighter color, and compact line height.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the MySQL host/port secondary text renders as `11px`, `400` font weight, and `15px` line height.

## Known Risks Or Follow-Up Items

- None.
