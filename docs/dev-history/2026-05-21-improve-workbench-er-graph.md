# 2026-05-21 Improve Workbench ER Graph

## Date And Time

2026-05-21 14:55:49 CST

## Request Summary

Fixed distorted ER relationship labels and made the workbench ER diagram more complex.

## Changed Files

- `src/views/WorkbenchView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-21-improve-workbench-er-graph.md`

## Implementation Notes

- Moved ER relationship labels out of SVG text into positioned HTML labels to prevent text distortion from SVG scaling.
- Expanded the ER graph from 7 nodes and 8 edges to 11 nodes and 14 edges.
- Added industry, region, campaign, and owner entities to the graph.
- Added matching table metadata entries for industry, campaign, and owner tables.
- Increased the ER canvas height and tightened node typography to keep the richer graph readable.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/workbench` in the browser.
- Verified the ER view renders 11 nodes, 14 relationship lines, and 14 HTML relationship labels.
- Verified the SVG no longer contains text elements, so labels are not distorted by SVG scaling.

## Known Risks Or Follow-Up Items

- The ER graph is still a static UI placeholder. Real table layout and relationship generation need backend integration later.
