# Line Split Workbench Layout

## Date

2026-05-20 18:20 CST

## Request Summary

Change the workbench layout so the left lists and right workbench area are separated by a line instead of appearing as two boxed panels.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-line-split-workbench-layout.md`

## Implementation Notes

- Removed the large borders, rounded corners, and shadows from the left and right workbench areas.
- Removed the grid gap between the left list area and the right interaction area.
- Added a single vertical divider on the right edge of the left list area.
- Adjusted left and right internal padding to preserve spacing around the divider.
- Kept the lightweight list row separators inside the left panel.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Opened `/workbench` in the browser and confirmed the workbench, both list titles, and prompt input still render.

## Known Risks

- The workbench remains a static UI preview and does not include backend task or data-source logic.
