# Database

## Current State

This repository does not define or run a database. There are no migrations, ORM models, seed scripts, SQL files, or local persistence layers in the frontend codebase.

All durable data is expected to be owned by the backend API behind `/api/v1`.

## Frontend Data Models Inferred From API Usage

The frontend currently depends on these backend concepts:

### Session

Expected fields used by the UI:

- `id`: stable session identifier.
- `title`: user-facing title.

Used by:

- `GET /sessions`
- `POST /sessions`
- `PATCH /sessions/:sessionId`
- `DELETE /sessions/:sessionId`

### Message

Expected fields used by the UI:

- `id`
- `role`: `user` or `assistant`
- `content`
- `status`
- `meta.text`

Used by:

- `GET /history/:sessionId`
- chat streaming events.

### Workspace File

Expected fields are backend-dependent. The frontend can upload local `File` objects and request file tree/content operations by path.

Used by:

- `POST /workspace/:sessionId/upload`
- `GET /workspace/:sessionId/tree`
- `GET /workspace/:sessionId/file`
- `PUT /workspace/:sessionId/file`
- `POST /workspace/:sessionId/fs`

## Constraints For Codex

- Do not invent SQL migrations in this frontend repository.
- Do not assume database table names unless backend documentation is added.
- If a feature needs persistence, add or update an API contract first.
- If backend schemas become available, document them here before generating SQL or data-model code.

