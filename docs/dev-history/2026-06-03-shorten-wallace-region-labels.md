# Shorten Wallace Region Labels

Date: 2026-06-03 10:40 CST

## Summary

Removed the trailing "区域" suffix from user-facing Wallace report region names. The underlying selected value still keeps the original CSV/API region key, so filtering and aggregation continue to use the existing data contract.

## Changes

- Added a shared `formatRegionName` display formatter in the Wallace report view.
- Changed the region filter placeholder from "全部区域" to "全部".
- Applied the shortened display name to the region filter options, region profit, low-price risk, region health, and combo margin panels.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
