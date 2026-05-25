# 2026-05-22 Swap Workbench And Fix Table Scroll

## Date And Time

2026-05-22 13:32:12 CST

## Request Summary

Swapped the workbench chat area and execution result area, and fixed the result dataset table list so it scrolls when there are more tables than the visible area.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-22-swap-workbench-and-fix-table-scroll.md`

## Implementation Notes

- Changed the workbench main grid to render the chat workbench on the left and execution results on the right.
- Moved the vertical divider to the right edge of the workbench chat column.
- Updated result-area padding for the swapped layout.
- Added fixed-height grid constraints through the dataset section, dataset browser, and table explorer.
- Changed the table list to use an internal vertical scrollbar.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the workbench chat area renders to the left of the execution result area.
- Verified the main grid columns render as `1fr 3fr`.
- Verified the table list is an internal scroll container with `overflow-y: auto` and `scrollHeight > clientHeight`.

## Known Risks Or Follow-Up Items

- None.
