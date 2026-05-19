# Progressive Multi-Agent Display

## Date

2026-05-19 14:06 CST

## Request Summary

Adjust multi-Agent execution display so Agents appear progressively: show the plan Agent first, then generated subtask Agents, update each subtask with its result, then show the summary Agent and final answer.

## Changed Files

- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-progressive-multi-agent-display.md`

## Implementation Notes

- Kept the `计划 Agent` as the only visible workflow step when multi-Agent execution starts.
- Added subtask Agents only after the plan Agent returns generated tasks.
- Removed the early pending `总结 Agent` display.
- Added the `总结 Agent` only after all subtask Agent requests complete.
- Kept per-subtask status and output updates as each subtask finishes.
- Updated API documentation to describe progressive Agent display behavior.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Confirmed the local Vite dev server returns `HTTP/1.1 200 OK` after hot update.

## Known Risks

- Subtask Agents still run in parallel, so their completion order can differ from their display order.
