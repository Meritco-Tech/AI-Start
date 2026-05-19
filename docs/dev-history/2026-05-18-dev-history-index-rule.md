# Development History Index Rule

## Date

2026-05-18 18:27 Asia/Shanghai

## Request Summary

Update `AGENTS.md` so Codex automatically maintains a high-level modification history list in `docs/dev-history/README.md`.

## Changed Files

- `AGENTS.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-dev-history-index-rule.md`

## Implementation Notes

- Added a rule requiring Codex to update `docs/dev-history/README.md` whenever a new change-history file is written.
- Required the history index to stay in reverse chronological order.
- Added a `History Index` table to `docs/dev-history/README.md`.
- Backfilled the index with the existing history entries.

## Verification

- Verified the existing `AGENTS.md` and `docs/dev-history/README.md` content before editing.
- No build was run because this task only changes documentation.

## Risks And Follow-ups

- Future file-changing tasks must update both the task-specific history file and the README index.
