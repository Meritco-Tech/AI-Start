# Replace Avatar And Health Visual

Date: 2026-06-03 11:12 CST

## Summary

Removed the real-person avatar from the dock and redesigned the Wallace region health panel into a more visual risk-scale presentation.

## Changes

- Replaced the dock avatar image with a CSS-rendered `AI` system badge and status dot.
- Added a `maxZoneHealth` computed value for scaling region health rows.
- Added a health tone helper for high, medium, and low risk styling.
- Replaced the region health table-style list with labeled risk-scale rows.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
