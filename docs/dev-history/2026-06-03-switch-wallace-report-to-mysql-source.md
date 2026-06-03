# 2026-06-03 Switch Wallace Report To MySQL Source

## Summary
- Changed the Wallace report middleware default data source from local CSV files to MySQL.
- Added server-side Wallace report MySQL configuration with password loaded from `WALLACE_REPORT_MYSQL_PASSWORD`.
- Reimplemented catalog, overview aggregation, and table sample reads against `data_metrics_v2` while keeping frontend response shapes unchanged.
- Preserved the CSV reader path for tests and temporary debugging when `WALLACE_REPORT_DATA_DIR` is set.

## Files Changed
- `server/wallaceReportDatabaseConfig.js`
- `server/wallaceReportService.js`
- `server/wallaceReportMiddleware.js`
- `.env.example`
- `.env.local` (ignored local secret file)
- `docs/api.md`
- `docs/database.md`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-06-03-switch-wallace-report-to-mysql-source.md`

## Verification
- `node --test server/__tests__/wallaceReportService.test.js`
- Real MySQL catalog and overview smoke test against `data_metrics_v2`
- `node ./node_modules/vite/bin/vite.js build`
