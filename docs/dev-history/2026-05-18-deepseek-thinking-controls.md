# DeepSeek Thinking Controls

## Date

2026-05-18 22:41 CST

## Request Summary

Add UI controls for DeepSeek thinking mode and reasoning effort, and ensure chat requests use DeepSeek API-compatible request fields.

## Changed Files

- `src/api/deepseek.js`
- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-deepseek-thinking-controls.md`

## Implementation Notes

- Added DeepSeek reasoning effort options: `high` and `max`.
- Added a session header switch for `thinking.type` and a segmented control for `reasoning_effort`.
- Sends `thinking: { type: "enabled" }` plus `reasoning_effort` when thinking mode is enabled.
- Sends `thinking: { type: "disabled" }` and omits `reasoning_effort` when thinking mode is disabled.
- Omits `temperature` in thinking mode and only keeps it for non-thinking mode.
- Updated the visible thinking progress to include the selected model, thinking mode, and reasoning effort for the submitted request.
- Documented the request shape and DeepSeek thinking controls in `docs/api.md`.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the thinking mode switch, reasoning effort options, and page render with zero captured console errors.

## Risks And Follow-ups

- DeepSeek may only return detailed `reasoning_content` when thinking mode is enabled and the selected model/provider supports it.
