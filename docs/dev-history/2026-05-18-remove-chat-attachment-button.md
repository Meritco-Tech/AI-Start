# Remove Chat Attachment Button

## Date

2026-05-18 18:24 Asia/Shanghai

## Request Summary

Remove the attachment icon/button from the lower-left corner of the session question input box.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/2026-05-18-remove-chat-attachment-button.md`

## Implementation Notes

- Removed the unused `Paperclip` icon import.
- Removed the attachment `el-button` from the composer.
- Changed the composer grid from three columns to two columns so the input fills the removed button space and the send button remains on the right.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Build completed successfully.

## Risks And Follow-ups

- The left file upload panel remains available for attaching files.
- The composer no longer exposes a secondary attachment entry point.
