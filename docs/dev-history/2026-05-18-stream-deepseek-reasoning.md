# Stream DeepSeek Reasoning

## Date

2026-05-18 22:47 CST

## Request Summary

Make the session thinking process update dynamically before the final answer arrives by streaming DeepSeek reasoning and answer deltas.

## Changed Files

- `src/api/deepseek.js`
- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-stream-deepseek-reasoning.md`

## Implementation Notes

- Added a streaming DeepSeek chat helper that parses SSE `data:` events from the official chat completion stream.
- Appends `choices[0].delta.reasoning_content` directly to the thinking panel as chunks arrive.
- Appends `choices[0].delta.content` directly to the assistant answer as chunks arrive.
- Keeps the visible frontend progress as a fallback while no reasoning deltas have arrived.
- Falls back to the non-streaming request path if streaming is unavailable or fails.
- Updated `docs/api.md` to document the streaming request shape and delta handling.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the session page, thinking controls, and composer render with zero captured console errors.

## Risks And Follow-ups

- Live reasoning depends on DeepSeek returning `reasoning_content` deltas; when thinking mode is disabled or unsupported, only answer content may stream.
