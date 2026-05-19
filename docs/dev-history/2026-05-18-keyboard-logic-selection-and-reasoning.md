# Keyboard Logic Selection And Reasoning Display

## Date

2026-05-18 22:04 Asia/Shanghai

## Request Summary

Improve instruction logic selection so the selected logic appears after `@` with a trailing space, support keyboard selection, and show AI reasoning process in chat output.

## Changed Files

- `src/api/deepseek.js`
- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-keyboard-logic-selection-and-reasoning.md`

## Implementation Notes

- Added `getDeepSeekReasoningText` to read common reasoning fields such as `reasoning_content`.
- Added keyboard navigation for the instruction logic picker:
  - `ArrowDown` moves to the next logic;
  - `ArrowUp` moves to the previous logic;
  - `Enter` selects the highlighted logic;
  - `Escape` closes the picker.
- Changed selected logic insertion to write `@逻辑名称 ` with an automatic trailing space.
- Kept instruction logic selection single-choice.
- Added a reasoning panel above assistant content when the model response includes reasoning text.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` in the browser and confirmed the composer renders, the old selected logic bar remains absent, and no console errors were reported.

## Risks And Follow-ups

- The reasoning panel only appears when the DeepSeek proxy returns a reasoning field.
- Some selected model variants may not return `reasoning_content`.
