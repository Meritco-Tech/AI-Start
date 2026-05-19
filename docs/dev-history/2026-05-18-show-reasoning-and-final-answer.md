# Show Reasoning And Final Answer

## Date

2026-05-18 23:31 CST

## Request Summary

Ensure session responses display both the question reasoning process and the final answer.

## Changed Files

- `src/api/deepseek.js`
- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-show-reasoning-and-final-answer.md`

## Implementation Notes

- Expanded DeepSeek final-answer extraction to support standard `message.content` plus compatible answer and output fields.
- Added a system instruction requiring a final answer even when thinking mode is enabled.
- Split assistant rendering into explicit `思考过程` and `最终答案` panels.
- Added an empty-answer notice when DeepSeek returns reasoning without final answer text.
- Updated API documentation to describe the two-panel response rendering.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the session page renders with zero captured console errors.

## Risks And Follow-ups

- If the provider returns only `reasoning_content` and no final answer field, the UI can surface the issue but cannot invent the missing final answer.
