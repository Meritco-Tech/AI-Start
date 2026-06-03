# Compact Wallace Health Map

Date: 2026-06-03 11:15 CST

## Summary

Made the Wallace region health panel more compact and removed row separators between regions.

## Changes

- Removed the separator line between health-map rows.
- Reduced health-map row gap, row height, caption spacing, and scale-bar height.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
