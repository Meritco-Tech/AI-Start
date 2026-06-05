# 2026-06-04 Remove Wallace Selected-Zone Inner Borders

## Summary
- Removed inner borders from selected-zone core metric rows.
- Removed inner borders from selected-zone risk metric rows.
- Removed inner borders from selected-zone combo quality metric rows.
- Removed inner borders from selected-zone trend summary rows.
- Removed inner borders from selected-zone customer insight and channel margin summary cards.

## Files Changed
- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-04-remove-wallace-selected-zone-inner-borders.md`

## Verification
- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser check: confirmed selected-zone core metrics, risk metrics, combo metrics, trend summaries, customer insights, and channel margin summaries have no inner borders.
