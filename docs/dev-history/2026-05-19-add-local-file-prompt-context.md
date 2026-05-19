# Add Local File Prompt Context

## Date

2026-05-19 12:00 CST

## Request Summary

When files are uploaded in the `本地文件` section, use their content as reference context for analysis. When no local files are uploaded, answer from model knowledge.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-add-local-file-prompt-context.md`

## Implementation Notes

- Added text-file detection for local reference files.
- Added local file text extraction in the browser for common text formats such as Markdown, CSV, JSON, logs, code files, and plain text.
- Added per-file and total prompt-context length limits to avoid oversized prompts.
- Added a `本地文件参考` section to the submitted full prompt when local files are uploaded.
- Kept no-file behavior unchanged: if no local files are uploaded, no local file context is appended and the model answers from its own knowledge plus any selected instruction logic or smart-search context.
- Added transparent notes for uploaded files whose body cannot be parsed by the frontend.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.

## Known Risks

- Binary formats such as PDF, Word, and Excel are listed as uploaded files, but their body text is not extracted by the frontend yet.
- Long local files are truncated before being appended to the model prompt.
