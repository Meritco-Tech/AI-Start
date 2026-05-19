# Improve Smart Search Fallback

## Date

2026-05-19 11:36 CST

## Request Summary

Fix smart search returning `未返回可用结果` for Chinese company analysis queries such as `久谦咨询`.

## Changed Files

- `src/api/search.js`
- `src/views/SessionView.vue`
- `vite.config.js`
- `docs/api.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-19-improve-smart-search-fallback.md`

## Implementation Notes

- Added a 360 Search Vite proxy at `/api/v1/search/so`.
- Kept DuckDuckGo Instant Answer as the first search source.
- Added automatic fallback to 360 Search when DuckDuckGo returns no usable results or fails.
- Added client-side HTML result parsing for 360 Search result pages.
- Added the resolved search source to the submitted `完整 Prompt` smart-search block.
- Updated API documentation to describe the two-source smart-search flow.

## Verification

- Ran `vite build --outDir /private/tmp/eidos-fe-build --emptyOutDir`; build passed with the existing large-chunk warning.
- Restarted the local Vite dev server on `http://127.0.0.1:5173/`.
- Confirmed the app returns `HTTP/1.1 200 OK`.
- Confirmed `/api/v1/search/so?q=久谦咨询` returns a 360 Search HTML result page through the local proxy.
- Opened `/sessions` in the browser and confirmed the session page renders.
- Parsed the 360 Search DOM for `久谦咨询` in the browser and confirmed multiple usable results are available.

## Known Risks

- 360 Search returns HTML, so parser selectors may need adjustment if the upstream page structure changes.
- Search result quality depends on upstream search engine availability and ranking.
