# Live Multi-Agent Progress

## Date

2026-05-19 14:54 CST

## Request Summary

Fix multi-Agent mode so each Agent appears and updates while it is working instead of displaying all Agent information only after the full analysis completes.

## Changed Files

- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-live-multi-agent-progress.md`

## Implementation Notes

- Replaced direct mutation of the assistant message object with reactive message patching through the `messages` array.
- Added helper functions to patch assistant messages, append Agent workflow steps, and update individual Agent steps.
- Added per-Agent elapsed-time progress updates while DeepSeek requests are running.
- Changed subtask Agent display so each subtask is appended when that subtask starts working.
- Kept final-answer rendering tied to the summary Agent completion.
- Updated API documentation to describe live Agent progress updates.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Confirmed the local Vite dev server returns `HTTP/1.1 200 OK` after hot update.

## Known Risks

- DeepSeek responses are still non-streaming, so live updates show Agent lifecycle and elapsed time, while each Agent's detailed output appears after that Agent request returns.
