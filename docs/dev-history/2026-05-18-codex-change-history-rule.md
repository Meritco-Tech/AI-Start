# Codex Change History Rule

## Date

2026-05-18 18:21 Asia/Shanghai

## Request Summary

Require Codex to report modification history and persist change-history notes under `docs/dev-history/`.

## Changed Files

- `AGENTS.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-codex-change-history-rule.md`

## Implementation Notes

- Added a mandatory `Change History Rules` section to `AGENTS.md`.
- Defined the required filename format: `YYYY-MM-DD-short-task-name.md`.
- Defined required entry sections: date/time, request summary, changed files, implementation notes, verification, and risks/follow-ups.
- Added a directory-level README for `docs/dev-history/`.

## Verification

- Confirmed files were written through the patch operation.
- No build was run because this task only changes documentation.

## Risks And Follow-ups

- Future Codex tasks that change files should write a task-specific history entry before final delivery.
- Do not include secrets or credentials in history entries.
