# Add Smart Search Toggle

## Date

2026-05-19 11:19 CST

## Request Summary

Add a DeepSeek-style smart search switch to the session page, defaulting to off, so users can choose between model-only answers and answers augmented by online search.

## Changed Files

- `src/api/search.js`
- `src/views/SessionView.vue`
- `vite.config.js`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-add-smart-search-toggle.md`

## Implementation Notes

- Added a `智能搜索` switch in the session header with a default off state.
- Added a DuckDuckGo search proxy through Vite at `/api/v1/search/duckduckgo`.
- Added `src/api/search.js` to normalize search results into prompt-ready snippets.
- When smart search is enabled, the session page performs search first and appends search results to the full submitted prompt.
- When smart search is disabled, the system prompt explicitly tells DeepSeek not to claim web search was performed.
- Documented that DeepSeek's public API does not currently expose the same one-click web search parameter as the web/app interface, so this implementation uses pre-search plus prompt augmentation.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Restarted the local Vite dev server so the new search proxy is active.
- Confirmed `http://127.0.0.1:5173/` returns `HTTP/1.1 200 OK`.
- Called the local DuckDuckGo proxy and confirmed it returns search JSON.
- Opened `/sessions` in the browser and confirmed the `智能搜索` switch renders with zero captured console errors.

## Risks And Follow-ups

- DuckDuckGo Instant Answer results can be sparse for some queries; a production deployment may want a dedicated search provider or backend search service.
- Because `vite.config.js` changed, an already running Vite dev server may need to be restarted for the new search proxy to take effect.
