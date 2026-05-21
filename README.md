# Enterprise EIDOS Frontend

Enterprise EIDOS Frontend is a Vue 3 + Vite application for an enterprise AI decision workspace. It provides a dock-style navigation shell, workspace analysis view, session chat view, file upload interactions, report display, and placeholder areas for notifications and administration.

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Element Plus
- Native `fetch` API wrappers

## Requirements

- Node.js `>=22.12.0`
- npm compatible with the checked-in `package-lock.json`

## Setup

```bash
npm ci
```

## Development

```bash
npm run dev
```

The dev server is configured by `vite.config.js`. Requests under `/api` are proxied to the backend configured there.

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Important Routes

- `/home`: main workspace and analysis page.
- `/workbench`: static workbench page with data source list, task list, and interaction preview.
- `/sessions`: file-assisted chat page.
- `/files`: redirects to `/sessions`.
- `/notice`: notification placeholder.
- `/admin`: administration placeholder.

## Environment

See `.env.example`.

Common variables:

- `VITE_API_ORIGIN`: optional API origin. Empty means same origin.
- `VITE_API_PREFIX`: API prefix, default `/api/v1`.
- `VITE_USER_ID`: default user id used by API calls, default `10001`.

## Repository Structure

```text
src/
  api/          API client wrappers
  components/   reusable Vue components
  config/       navigation and demo data
  router/       route definitions
  views/        route-level pages
public/         static Figma/exported assets
docs/           project documentation
```

## Project Documents

| File | Location | Purpose |
| --- | --- | --- |
| `AGENTS.md` | `AGENTS.md` | Project-level development rules for Codex and other AI coding agents, including workflow, coding, testing, and delivery expectations. |
| `README.md` | `README.md` | Project introduction, setup, scripts, routes, environment variables, repository structure, and documentation index. |
| `architecture.md` | `docs/architecture.md` | Frontend architecture, module boundaries, routing, API integration, and state-management constraints. |
| `database.md` | `docs/database.md` | Current database status, backend-owned data concepts, and constraints that prevent Codex from inventing frontend SQL or migrations. |
| `api.md` | `docs/api.md` | API base URL rules, request conventions, current endpoint map, streaming events, and compatibility expectations. |
| `testing.md` | `docs/testing.md` | Current verification strategy, required build checks, manual smoke checklist, and recommended future test tooling. |
| `coding-style.md` | `docs/coding-style.md` | Vue, naming, component, styling, API, error-handling, and data-safety conventions. |
| `product-requirements.md` | `docs/product-requirements.md` | Product goals, primary users, route-level experiences, non-goals, and UX principles. |
| `pull_request_template.md` | `.github/pull_request_template.md` | Pull request checklist for change summary, verification, risk, and reviewer notes. |
| `ci.yml` | `.github/workflows/ci.yml` | GitHub Actions workflow that installs dependencies with Node 22.12.0 and runs the production build. |
| `.env.example` | `.env.example` | Safe environment variable example for API origin, API prefix, and local development user id. |
| `config.toml` | `.codex/config.toml` | Project-local Codex defaults for model, sandbox, tools, project metadata, and common commands. |
