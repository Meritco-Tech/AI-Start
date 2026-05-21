# Adjust Workbench Width Ratio

## Date

2026-05-20 18:24 CST

## Request Summary

Change the workbench left list area and right workbench area width ratio from 1:3 to 1:6.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-adjust-workbench-width-ratio.md`

## Implementation Notes

- Updated the workbench grid columns to `minmax(220px, 1fr) minmax(0, 6fr)`.
- Kept the line-based divider layout introduced in the prior change.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.

## Known Risks

- The narrower left panel may need content truncation rules revisited if future data-source or task names become much longer.
