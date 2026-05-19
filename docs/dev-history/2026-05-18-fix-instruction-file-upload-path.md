# Fix Instruction File Upload Path

## Date

2026-05-18 21:00 Asia/Shanghai

## Request Summary

Fix the issue where uploading instruction-set files showed `path is not accessible`.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-fix-instruction-file-upload-path.md`

## Implementation Notes

- Removed the unsupported `instructions` upload target.
- Instruction-set files now upload to the same backend-accessible `permanent` workspace target as local files.
- The frontend still keeps instruction-set files in a separate `instructionFiles` list and sends `type: "instruction"` in the DeepSeek request metadata.

## Verification

- Searched the session view to confirm no `instructions` upload target remains.
- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Build completed successfully.

## Risks And Follow-ups

- Backend file storage no longer receives a distinct target path for instruction-set files; the distinction is maintained in frontend state and request metadata.
- If the backend later provides an accessible instruction-set upload path, the target can be changed behind the same UI.
