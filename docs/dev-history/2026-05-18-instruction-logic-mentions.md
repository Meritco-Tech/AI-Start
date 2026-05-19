# Instruction Logic Mentions

## Date

2026-05-18 21:17 Asia/Shanghai

## Request Summary

Support parsing prompt-related instruction-set files into analysis logic blocks marked by `[ ... ]`, allow selecting parsed logic blocks with `@` in the question input, and append selected logic blocks to submitted questions while displaying them in the chat.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-instruction-logic-mentions.md`

## Implementation Notes

- Added `instructionLogics` and `selectedInstructionLogicIds` state.
- Instruction-set files are read in the browser with `File.text()` after upload selection.
- Parsed analysis logic blocks use the text inside `[ ... ]` as the selectable title.
- Each parsed block stores its source file name and content until the next `[ ... ]` marker.
- Typing `@` in the question input shows a multi-select logic picker.
- Selected logic blocks appear as removable chips above the input.
- On submit, selected logic blocks are appended to the user's question and shown in the user message bubble.
- The DeepSeek payload uses the appended prompt and no longer duplicates the current user message in history context.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` in the browser and confirmed the base UI renders without console errors.
- Rechecked the session page after prompt cleanup changes; composer and file sections rendered correctly with no console errors.

## Risks And Follow-ups

- Instruction-set parsing currently targets text-readable files. Binary formats may parse poorly unless converted by a backend or document parser.
- The marker parser treats any `[ ... ]` as a logic boundary; instruction files should avoid unrelated bracketed text.
