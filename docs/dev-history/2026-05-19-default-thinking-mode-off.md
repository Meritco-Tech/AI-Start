# Default Thinking Mode Off

## Date

2026-05-19 11:14 CST

## Request Summary

Change the session page default thinking mode to off.

## Changed Files

- `src/views/SessionView.vue`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-default-thinking-mode-off.md`

## Implementation Notes

- Changed the default `isThinkingModeEnabled` state from `true` to `false`.
- Documented that the session page defaults DeepSeek thinking mode to disabled.
- Updated the documented default request example to send `thinking.type=disabled` with `temperature`.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.

## Risks And Follow-ups

- Users can still manually enable thinking mode in the session header.
