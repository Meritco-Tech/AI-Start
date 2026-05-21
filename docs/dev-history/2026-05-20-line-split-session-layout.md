# 2026-05-20 Line Split Session Layout

## Date And Time

2026-05-20 18:52:18 CST

## Request Summary

Changed the session page layout so the local/instruction file panel and chat interaction area are separated by a line instead of two framed panels.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-line-split-session-layout.md`

## Implementation Notes

- Removed the outer gap between the session file panel and chat area.
- Removed the shared card border, rounded corners, and shadow from the file panel and chat page.
- Added a single right border on the file panel to create the divider line.
- Added left padding to the chat page so content keeps comfortable spacing after removing the framed layout.

## Verification Performed

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build succeeded with the existing large chunk warning.
- Started the local Vite dev server and inspected `/sessions` in the browser.
- Verified the session page gap is `0`, the file panel only has a right divider line, and both outer panels have no card border, radius, or shadow.

## Known Risks Or Follow-Up Items

- The upload drop zones and individual file rows remain internally framed controls, since they are interactive elements rather than page-level containers.
