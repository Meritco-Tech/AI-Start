# Add Workbench Page

## Date

2026-05-20 17:40 CST

## Request Summary

Add a `工作台` entry in the left dock and create a workbench page that mirrors the session page layout, with a left list panel and a right interaction area. Only the UI display is required for now.

## Changed Files

- `src/config/dockItems.js`
- `src/router/index.js`
- `src/views/WorkbenchView.vue`
- `README.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-20-add-workbench-page.md`

## Implementation Notes

- Added a `工作台` dock item that routes to `/workbench`.
- Added a `/workbench` route and route metadata.
- Created `WorkbenchView.vue` with the same broad layout pattern as the session page.
- Split the workbench content into a 1:3 layout:
  - left panel with `数据源清单` and `任务清单`;
  - right panel with a static interactive chat preview.
- Kept all workbench interactions as UI-only placeholders with no backend calls.
- Updated README route documentation.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Confirmed `/workbench` returns `HTTP/1.1 200 OK` from the local Vite dev server.
- Opened `/workbench` in the browser and confirmed `工作台`, `数据源清单`, `任务清单`, and the workbench prompt input render.

## Known Risks

- The workbench page currently uses static demo data and does not persist tasks, data sources, or chat messages.
