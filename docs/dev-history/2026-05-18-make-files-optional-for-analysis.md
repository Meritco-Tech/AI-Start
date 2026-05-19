# Make Files Optional For Analysis

## Date

2026-05-18 23:01 CST

## Request Summary

Fix session analysis so selected instruction logic can drive analysis without requiring local files.

## Changed Files

- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-make-files-optional-for-analysis.md`

## Implementation Notes

- Reworded the DeepSeek system prompt to make local files optional context rather than an analysis prerequisite.
- Instructed the model to answer directly from the user question and selected analysis logic when those are sufficient.
- Limited file-unavailable messaging to cases where the user explicitly asks to analyze file content without providing readable file text.
- Removed the non-official `attached_files` field from the DeepSeek request payload.
- Updated API documentation to clarify that no file-required API option is sent.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` at `http://127.0.0.1:5173/sessions` in the browser and confirmed the session page renders with zero captured console errors.

## Risks And Follow-ups

- DeepSeek still cannot read local file contents unless those contents are explicitly included in the prompt or processed by a backend that injects them into messages.
