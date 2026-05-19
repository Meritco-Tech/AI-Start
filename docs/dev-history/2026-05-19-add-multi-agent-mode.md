# Add Multi-Agent Mode

## Date

2026-05-19 13:49 CST

## Request Summary

Add a switch that changes the session answer flow from a single Agent to a coordinator-style multi-Agent implementation, and show each Agent's progress and status in the conversation UI.

## Changed Files

- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-add-multi-agent-mode.md`

## Implementation Notes

- Added a default-off `多 Agent` switch in the session header.
- Added a coordinator flow with three stages:
  - `计划 Agent` creates a JSON task plan;
  - multiple `子任务 Agent` requests analyze independent subtasks in parallel;
  - `总结 Agent` synthesizes the final answer after all subtask results return.
- Reused the selected DeepSeek model, thinking mode, reasoning effort, local-file context, instruction logic, and smart-search prompt context.
- Added an in-message workflow panel that shows each Agent's name, role, status, detail text, and optional output.
- Added fallback task generation when the plan response cannot be parsed as JSON.
- Updated API documentation with the multi-Agent browser orchestration behavior.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Confirmed the local Vite dev server returns `HTTP/1.1 200 OK` after hot update.
- Opened `/sessions` in the browser and confirmed the `多 Agent` switch appears.

## Known Risks

- Multi-Agent mode makes multiple DeepSeek requests for one user question, so it uses more tokens and may take longer than single-Agent mode.
- The plan Agent is prompted to return JSON, but if it does not, the frontend falls back to a single generic subtask.
