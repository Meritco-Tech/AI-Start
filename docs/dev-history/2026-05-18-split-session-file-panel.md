# Split Session File Panel

## Date

2026-05-18 20:57 Asia/Shanghai

## Request Summary

Split the left-side file area on the session page into two parts: local files and instruction-set files.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-split-session-file-panel.md`

## Implementation Notes

- Added a separate `instructionFiles` collection.
- Split the left file panel into two sections: `本地文件` and `指令集文件`.
- Added independent upload handlers and remove actions for both file groups.
- Instruction-set uploads use the `instructions` workspace target; local files continue using `permanent`.
- DeepSeek request context now includes both local files and instruction-set files.
- Added section styling so both lists share the left panel cleanly.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Opened `/sessions` in the browser and confirmed two file sections render.
- Checked browser console logs for errors and warnings; none were reported.

## Risks And Follow-ups

- Backend support for the `instructions` upload target should be confirmed.
- If the backend returns parsed instruction content later, the DeepSeek proxy can enrich prompts with that content instead of file names only.
