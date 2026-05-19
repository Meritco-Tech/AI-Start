# Scroll Picker And Dynamic Thinking

## Date

2026-05-18 22:25 CST

## Request Summary

Fix keyboard navigation in the instruction logic picker so the highlighted option scrolls with the selection, and replace the static thinking state with a dynamically updated visible thinking progress while a question is being processed.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-scroll-picker-and-dynamic-thinking.md`

## Implementation Notes

- Added a picker ref and scroll helper so the `.keyboard-active` instruction logic option is brought into view with `scrollIntoView`.
- Centralized keyboard index changes through `setActiveInstructionLogicIndex`.
- Added a request-time thinking progress timer that updates the assistant reasoning panel with current processing steps.
- Kept provider-returned reasoning content as the preferred final reasoning display; when unavailable, the UI preserves the visible processing progress and notes that no deeper reasoning field was returned.
- Cleared the progress timer after success, failure, and component unmount.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the page, composer, and session UI render with zero captured console errors.

## Risks And Follow-ups

- The dynamic thinking display is frontend progress until the model response arrives; exact model reasoning still depends on whether the DeepSeek proxy returns a reasoning field.
