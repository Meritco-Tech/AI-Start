# Database

## Current State

This repository does not define migrations, ORM models, seed scripts, SQL files, or local persistence layers.

All durable product data is expected to be owned by the backend API behind `/api/v1`.

The workbench includes a development-only database proxy middleware for connecting to a configured read-only MySQL data source through Vite:

```text
server/workbenchDatabaseMiddleware.js
```

The browser must not connect directly to MySQL. The middleware reads server-side secrets, enforces read-only access, and exposes metadata/query endpoints under `/api/v1/workbench/database`.

## Wallace Report MySQL Data Source

The Wallace report module reads from MySQL by default through:

```text
server/wallaceReportMiddleware.js
server/wallaceReportService.js
server/wallaceReportDatabaseConfig.js
```

Current connection:

- id: `wallace-report-mysql`
- type: `mysql`
- host: `120.26.181.139`
- port: `3306`
- username: `dev_backend`
- database: `data_metrics_v2`
- charset: `utf8mb4`
- password environment variable: `WALLACE_REPORT_MYSQL_PASSWORD`

The database table names match the former local CSV file names without the `.csv` suffix. The report service keeps the frontend response shape unchanged by translating MySQL rows into the existing catalog, KPI, trend, risk, health, combo, and sample-table JSON fields.

For tests or temporary local debugging, setting `WALLACE_REPORT_DATA_DIR` switches the Wallace report middleware back to the CSV-compatible reader.

Do not commit real database passwords. Put the password only in local/server environment variables.

## Workbench MySQL Data Source

Configured connection metadata lives in:

```text
src/config/workbenchConnections.js
```

Current connection:

- id: `dev-mysql`
- type: `mysql`
- host: `120.26.178.41`
- port: `3306`
- username: `dev_backend`
- charset: `utf8mb4`
- password environment variable: `WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD`

Execution policy:

- read only: `true`
- require limit: `true`
- default limit: `100`
- max limit: `200`

Do not commit real database passwords. Put the password only in local/server environment variables.

## Workbench WeCom Document Source

The workbench can also display Tencent WeCom documents and spreadsheets as a non-SQL data source.

Configuration lives in:

```text
src/config/workbenchConnections.js
```

Development middleware lives in:

```text
server/workbenchWecomMiddleware.js
```

Current connection:

- id: `wecom-docs`
- type: `wecom`
- credential environment variables:
  - `WORKBENCH_WECOM_CORP_ID`
  - `WORKBENCH_WECOM_AGENT_ID` (optional for current token/file-list flow)
  - `WORKBENCH_WECOM_SECRET`
  - `WORKBENCH_WECOM_DEFAULT_SPACE_ID`
  - `WORKBENCH_WECOM_SPACES` (optional configured space list)

Do not commit real WeCom credentials. When credentials are present, the middleware requests a WeCom application token and reads file metadata from the default configured `spaceid`. If no default space is configured, it can still read configured spaces or attempt a best-effort space-list request; if the enterprise API does not expose a usable list response, the endpoint returns a clear fallback message and demo metadata for UI validation.

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
- Do not hardcode real database credentials into tracked files.
- Keep workbench SQL execution read-only and limit-bound.
- If a feature needs persistence, add or update an API contract first.
- If backend schemas become available, document them here before generating SQL or data-model code.
