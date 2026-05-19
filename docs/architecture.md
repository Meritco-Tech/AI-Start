# Architecture

## Overview

This repository is a frontend-only Vue SPA. It renders enterprise AI decision workflows and delegates persistence, chat jobs, streaming, workspace files, and session state to a backend API.

## Runtime Layers

```text
Browser
  -> Vue views
  -> Reusable components
  -> API wrappers in src/api
  -> Backend through /api/v1
```

## Frontend Boundaries

- `src/views/` contains route-level page composition.
- `src/components/` contains reusable UI sections.
- `src/config/` contains static navigation, seed data, and display categories.
- `src/api/` is the only place that should know endpoint paths and request formatting.
- `public/figma/` contains static visual assets exported from design.

## Routing

Routes are defined in `src/router/index.js`.

- `/home` loads the workspace.
- `/sessions` loads file-assisted chat.
- `/files` redirects to `/sessions`.
- `/notice` and `/admin` use placeholder pages until implemented.

Navigation items are defined separately in `src/config/dockItems.js`; update both route and navigation data when adding top-level pages.

## API Integration

`src/api/http.js` constructs API URLs from:

- `VITE_API_ORIGIN`
- `VITE_API_PREFIX`
- browser `window.location.origin`

`src/api/eidos.js` exposes domain-specific functions for sessions, history, chat jobs, streaming, workspace files, and skills.

## State Management

The project currently uses local Vue refs/computed state inside views. Do not add Pinia, Vuex, or another state manager unless multiple routes need shared mutable state and prop/event wiring becomes a real maintenance cost.

## Architecture Constraints

- Do not move API calls directly into low-level components.
- Do not couple components to route names unless they are route-level views.
- Do not replace Element Plus globally without a design migration plan.
- Keep backend assumptions documented in `docs/api.md`.

