# Show Full Prompt And Disable Dynamic Refresh

## Date

2026-05-18 23:10 CST

## Request Summary

Display the full submitted prompt in the session UI and remove dynamic refresh while the assistant answer is being generated.

## Changed Files

- `src/api/deepseek.js`
- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-show-full-prompt-and-disable-dynamic-refresh.md`

## Implementation Notes

- Removed the DeepSeek streaming helper and switched session chat back to non-streaming requests.
- Removed the frontend thinking-progress timer and its lifecycle cleanup.
- Kept a static waiting state while the request is pending.
- Added a user-message `完整 Prompt` display block that preserves the submitted prompt text, including appended instruction logic.
- Updated API documentation to describe non-streaming request behavior and full prompt rendering.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the session page renders with zero captured console errors.

## Risks And Follow-ups

- The UI now updates the assistant answer only after the full DeepSeek response returns.
