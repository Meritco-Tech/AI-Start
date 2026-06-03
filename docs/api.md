# API Design

## Base URL

API calls are built in `src/api/http.js`.

```js
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";
```

Final base URL:

```text
${VITE_API_ORIGIN}${VITE_API_PREFIX}
```

If `VITE_API_ORIGIN` is empty, requests use the current browser origin.

## Request Rules

- JSON requests set `Content-Type: application/json`.
- `FormData` requests must not set a manual content type.
- Query parameters must omit `undefined`, `null`, and empty string values.
- Failed responses should surface `error`, `message`, or `statusText`.
- All API wrapper functions should live in `src/api/eidos.js` unless a new domain grows large enough to split.

## Current Endpoints

### Sessions

- `GET /sessions?user_id=:userId`
- `POST /sessions`
- `PATCH /sessions/:sessionId`
- `DELETE /sessions/:sessionId?user_id=:userId`
- `POST /sessions/:sessionId/stop`

### History

- `GET /history/:sessionId?user_id=:userId`

### Chat

- `POST /chat`
- `GET /stream/:jobId?session_id=:sessionId&user_id=:userId`

Streaming uses `EventSource`.

Handled event names:

- `assistant_delta`
- `assistant_end`
- `progress`
- `tool_hint`
- `done`
- `error`

### DeepSeek Chat

The `/sessions` page sends right-side chat messages to a DeepSeek-compatible proxy endpoint.

Frontend wrapper:

- `src/api/deepseek.js`

Default frontend proxy path:

```text
/api/v1/deepseek/chat/completions
```

Config variable:

```bash
VITE_DEEPSEEK_PROXY_PATH=/deepseek/chat/completions
```

The Vite dev proxy rewrites `/api/v1/deepseek/chat/completions` to DeepSeek's official `/chat/completions` endpoint.

DeepSeek official origin:

```bash
DEEPSEEK_API_ORIGIN=https://api.deepseek.com
```

Secret name:

```bash
MERITCO_DS_KEY=
```

The user-facing credential name is `Meritco-DS-Key`. Because shell environment variables cannot reliably use hyphens, the local/server environment variable is `MERITCO_DS_KEY`.

`MERITCO_DS_KEY` must contain the DeepSeek API key in local/server secret storage only. Do not write the real key into tracked files, docs, frontend source, or variables prefixed with `VITE_`.

Authentication:

```text
Authorization: Bearer <MERITCO_DS_KEY>
```

Supported UI-selected models:

- `deepseek-v4-flash`
- `deepseek-v4-pro`

DeepSeek thinking controls:

- Thinking mode is controlled by `thinking.type`.
- Supported values are `enabled` and `disabled`.
- Reasoning effort is controlled by `reasoning_effort`.
- Supported UI values are `high` and `max`.
- The session page defaults thinking mode to disabled.
- When thinking mode is disabled, the frontend sends `thinking.type=disabled` and omits `reasoning_effort`.
- When thinking mode is enabled, the frontend sends `thinking.type=enabled` and the selected `reasoning_effort`; `temperature` is omitted because DeepSeek thinking mode does not apply sampling controls such as `temperature`.

Request shape:

```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": false,
  "thinking": { "type": "disabled" },
  "temperature": 0.2
}
```

The frontend selects `model`, `thinking.type`, and `reasoning_effort` from the session page controls and sends those values with each request.
The DeepSeek request does not send a custom file-required option. Local files are treated as optional context in the system prompt, and selected instruction logic is appended directly to the user question.

### Smart Search

The session page provides a `智能搜索` switch. It defaults to off.

- When `智能搜索` is off, the frontend does not perform web search and instructs DeepSeek to answer only from model knowledge, the user question, selected analysis logic, and conversation context.
- When `智能搜索` is on, the frontend first calls a web search proxy, then appends the search summary to the full submitted prompt before sending it to DeepSeek.
- The search context is shown in the user-side `完整 Prompt` block so the submitted online context is auditable.
- DeepSeek's public API does not expose the same one-click web search parameter as the DeepSeek web/app interface, so this project implements smart search as a pre-search step plus prompt augmentation.

Search proxy:

```text
GET /api/v1/search/duckduckgo
GET /api/v1/search/so
```

The Vite dev proxy rewrites these paths to:

```text
https://api.duckduckgo.com/
https://www.so.com/s
```

Search behavior:

- The frontend first requests DuckDuckGo Instant Answer for entity summaries and related topics.
- If DuckDuckGo returns no usable results or the request fails, the frontend falls back to 360 Search HTML results. This fallback improves Chinese company and market-topic coverage.
- The submitted prompt includes the resolved search source so users can audit whether the answer used `DuckDuckGo Instant Answer` or `360 Search`.

Chat rendering:

- The session page displays the full submitted user prompt, including selected instruction logic content.
- The assistant answer is rendered after the non-streaming DeepSeek response completes.
- If DeepSeek returns `reasoning_content`, it is shown in a `思考过程` panel.
- The final answer is always shown in a separate `最终答案` panel.
- If the response includes reasoning but no final answer text, the UI displays an explicit empty-answer notice instead of silently hiding the answer panel.
- The UI does not dynamically refresh the thinking process while waiting.

### Multi-Agent Mode

The session page provides a `多 Agent` switch. It defaults to off.

- When `多 Agent` is off, the session uses the existing single DeepSeek request flow.
- When `多 Agent` is on, the frontend uses a coordinator pattern:
  - a `计划 Agent` asks DeepSeek to return a JSON analysis plan with independent subtasks;
  - each subtask is sent to an independent `子任务 Agent` request;
  - when all subtask requests finish, a `总结 Agent` request synthesizes the final answer.
- The same model, thinking mode, reasoning effort, local-file prompt context, selected instruction logic, and smart-search context are used by the multi-agent flow.
- The session UI displays Agents progressively: first the plan agent, then generated subtask agents, then the summary agent after all subtasks return.
- Agent workflow state is committed through reactive message updates so the UI refreshes while work is running, not only after the whole workflow completes.
- Running agents refresh their detail text with elapsed time, and each subtask agent updates its own status and output as soon as its request completes.
- Subtask agents are dispatched in parallel from the browser. If an individual subtask fails, its error is shown in the workflow panel and the summary stage can still use the remaining outputs.

### Wallace Report MySQL Source

The Wallace report API reads from MySQL by default. The table names in the
database match the former local CSV file names without the `.csv` suffix.

Default non-secret connection values:

```env
WALLACE_REPORT_MYSQL_HOST=120.26.181.139
WALLACE_REPORT_MYSQL_PORT=3306
WALLACE_REPORT_MYSQL_USER=dev_backend
WALLACE_REPORT_MYSQL_DATABASE=data_metrics_v2
WALLACE_REPORT_MYSQL_PASSWORD=
```

`WALLACE_REPORT_MYSQL_PASSWORD` is server-side only and must be set in local or
deployment secret storage. Do not prefix it with `VITE_`.

For temporary CSV compatibility in tests or local debugging, set
`WALLACE_REPORT_DATA_DIR`; when this variable is present the Wallace report
middleware uses the CSV directory instead of MySQL.

Implemented endpoints:

```text
GET /api/v1/wallace-reports/catalog
GET /api/v1/wallace-reports/overview?month=202605&zone=上海区域
GET /api/v1/wallace-reports/tables/:tableId/sample?limit=20
```

The response shapes are unchanged from the CSV-backed implementation, so the
frontend report page can keep using the same catalog, KPI, trend, risk, health,
combo, and table-sample fields.

### Workbench Database Connections

The workbench page reads database connection metadata from:

```text
src/config/workbenchConnections.js
```

Current configured connection:

- id: `dev-mysql`
- name: `开发 MySQL`
- type: `mysql`
- host: `120.26.178.41`
- port: `3306`
- username: `dev_backend`
- charset: `utf8mb4`
- connect timeout: `8s`
- read timeout: `20s`
- write timeout: `20s`

Credential rule:

- The real database password must not be written into frontend source, docs, or any tracked config file.
- The tracked config stores only the server-side environment variable name:

```bash
WORKBENCH_MYSQL_DEV_BACKEND_PASSWORD=
```

Execution policy:

- `read_only: true`
- `require_limit: true`
- `default_limit: 100`
- `max_limit: 200`

The workbench data-source list displays this configured MySQL connection as a data source. Clicking it calls the local workbench database API. The browser still does not connect directly to MySQL; Vite serves a development backend middleware from:

```text
server/workbenchDatabaseMiddleware.js
```

Implemented endpoints:

```text
POST /api/v1/workbench/database/connect?connection_id=dev-mysql
GET /api/v1/workbench/database/tables?connection_id=dev-mysql&limit=200
GET /api/v1/workbench/database/tables/:tableName/schema?connection_id=dev-mysql&schema=:schemaName
POST /api/v1/workbench/database/query?connection_id=dev-mysql
```

Runtime behavior:

- `/connect` opens a MySQL connection through `mysql2`, returns version/schema metadata, and does not expose credentials.
- `/tables` reads `information_schema.TABLES` and `information_schema.COLUMNS` to return accessible table metadata.
- `/tables/:tableName/schema` reads `information_schema.COLUMNS` and `information_schema.KEY_COLUMN_USAGE` to return fields and foreign keys.
- `/query` runs read-only SQL only after policy enforcement.

Backend enforcement requirements:

- only allow read-only statements;
- reject mutation and DDL statements such as `insert`, `update`, `delete`, `drop`, `alter`, and `truncate`;
- require or inject a `LIMIT`;
- apply default limit `100`;
- cap requested limits at `200`;
- return structured JSON errors with `message` or `error`.

### Workbench Tencent WeCom Documents

The workbench page also exposes Tencent WeCom as a document data source. Connection metadata lives in:

```text
src/config/workbenchConnections.js
```

Current configured connection:

- id: `wecom-docs`
- name: `腾讯企业微信`
- type: `wecom`
- description: `文档与表格`

Credential rule:

- Do not commit real WeCom credentials.
- Store only server-side environment variable names in tracked files:

```bash
WORKBENCH_WECOM_CORP_ID=
WORKBENCH_WECOM_AGENT_ID=
WORKBENCH_WECOM_SECRET=
WORKBENCH_WECOM_DEFAULT_SPACE_ID=
WORKBENCH_WECOM_SPACES=
```

Implemented development endpoints:

```text
POST /api/v1/workbench/wecom/connect?connection_id=wecom-docs
GET /api/v1/workbench/wecom/spaces?connection_id=wecom-docs
GET /api/v1/workbench/wecom/files?connection_id=wecom-docs&space_id=:spaceid
```

Runtime behavior:

- `/connect` uses the configured enterprise id and application secret to request a WeCom application `access_token`; the token is never returned to the browser.
- `/spaces` first reads configured spaces from `WORKBENCH_WECOM_DEFAULT_SPACE_ID` or `WORKBENCH_WECOM_SPACES` in the form `spaceid:display_name,spaceid2:display_name2`.
- If no spaces are configured, `/spaces` attempts a best-effort WeDrive space-list request and returns a clear fallback message when the enterprise API does not expose a usable list response.
- `/files` calls WeCom WeDrive file-list API with the requested `space_id`; if none is passed, it uses `WORKBENCH_WECOM_DEFAULT_SPACE_ID`.
- When credentials are not configured, the middleware returns a local demo file list so the UI interaction remains usable.
- When the application token succeeds but the file-list API is unavailable because of app permission or WeDrive scope, the middleware returns a clear message and demo fallback entries.

### Workspace

- `GET /workspace/:sessionId/tree`
- `POST /workspace/:sessionId/upload`
- `POST /workspace/:sessionId/fs`
- `GET /workspace/:sessionId/skills`
- `GET /workspace/:sessionId/file`
- `PUT /workspace/:sessionId/file`

## Compatibility Rules

- Keep `user_id` behavior consistent across endpoints.
- Preserve existing stream event names unless backend and frontend are changed together.
- New endpoints should return JSON for normal responses and structured errors with `message` or `error`.
- UI code should handle unavailable backend endpoints with user-visible feedback.
