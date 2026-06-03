# Add KPI Sparklines And Operator Icon

Date: 2026-06-03 13:42 CST

## Summary

Changed the dock badge into an operator icon and added compact monthly trend sparklines to the KPI cards.

## Changes

- Replaced the dock bottom badge text with the `UserFilled` operator icon.
- Added a compact `kpiSparkline` computed series based on the report monthly trend.
- Added right-aligned SVG sparklines to each KPI card.
- Updated KPI card layout to support icon, metric copy, and sparkline columns without increasing card height.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
