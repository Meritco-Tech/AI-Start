# Remove KPI Sparklines Add Recommendation Icons

Date: 2026-06-03 13:47 CST

## Summary

Removed the KPI sparklines and added icons to the recommendation analysis panels.

## Changes

- Removed the `kpiSparkline` computed helper.
- Removed KPI sparkline SVGs from all five KPI cards.
- Restored KPI card layout to icon plus metric copy.
- Added a `PriceTag` icon to each recommendation panel title.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
