# Single Instruction Logic Selection

## Date

2026-05-18 21:28 Asia/Shanghai

## Request Summary

Change instruction logic selection so the selected logic is displayed after the `@` prompt in the input box, and only one analysis logic can be selected at a time.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-single-instruction-logic-selection.md`

## Implementation Notes

- Replaced multi-select logic state with a single selected logic id.
- Selecting a logic now replaces the current `@...` input token with `@逻辑名称`.
- Removed the selected-logic chip bar above the composer.
- The prompt builder now appends only the single selected logic to the submitted question.
- The picker closes after one logic is selected.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` in the browser and confirmed the composer renders, the old selected-logic chip bar is absent, and no console errors were reported.

## Risks And Follow-ups

- The picker interaction depends on instruction files being uploaded and parsed first.
- If users need multi-logic composition again later, the prompt builder and UI state will need to be expanded deliberately.
