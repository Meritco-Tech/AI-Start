# AGENTS.md

This file is the project-level operating guide for Codex and other AI coding agents working in `enterprise-eidos-fe`.

## Project Snapshot

- App type: Vue 3 single-page frontend.
- Build tool: Vite.
- UI library: Element Plus and `@element-plus/icons-vue`.
- Router: `vue-router`.
- Backend access: browser `fetch` through `src/api/http.js`, defaulting to `/api/v1`.
- Local database: none in this frontend repository.

## Required Workflow

1. Read the relevant source files before editing.
2. Keep changes scoped to the user request.
3. Prefer existing layout, naming, color, spacing, and Element Plus conventions.
4. Do not rewrite generated assets, `dist`, lockfiles, or cached dependency files unless the task explicitly requires it.
5. Before finishing, run the smallest meaningful verification:
   - `npm run build` when npm is available.
   - Or `node ./node_modules/vite/bin/vite.js build` with Node `>=22.12.0`.
   - For UI changes, verify the affected route in a browser when possible.

## Commands

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The project scripts use `npx -y node@22`; Node `>=22.12.0` is required.

## Coding Rules

- Use Vue single-file components with `<script setup>`.
- Keep API wrappers in `src/api/`; components should not duplicate request URL construction.
- Keep route definitions in `src/router/index.js`.
- Keep shared navigation data in `src/config/dockItems.js`.
- Use Element Plus components and icons before adding custom UI primitives.
- Keep CSS scoped in components unless it is a true global reset or token.
- Do not hard-code secrets, tokens, or private backend URLs in source files.
- Do not introduce a new state management library without a clear architecture decision.

## Delivery Rules

- Summarize changed files and behavior.
- Mention verification performed and any warning that remains.
- If a backend endpoint is unavailable, keep the UI resilient and document the assumption.

## Change History Rules

Codex must report and persist modification history for every task that changes files.

- Before final delivery, create or update a Markdown change-history file under `docs/dev-history/`.
- Use this filename format: `YYYY-MM-DD-short-task-name.md`.
- Also update `docs/dev-history/README.md` with a high-level history list entry that links to the new change-history file.
- Keep the `docs/dev-history/README.md` history list in reverse chronological order, newest first.
- Each history entry must include:
  - date and local time;
  - request summary;
  - changed files;
  - implementation notes;
  - verification performed;
  - known risks or follow-up items.
- The final response must mention the change-history file that was written.
- Do not store secrets, API keys, or private credentials in change-history files.
- For tasks that only answer a question and do not change files, no change-history file is required.
