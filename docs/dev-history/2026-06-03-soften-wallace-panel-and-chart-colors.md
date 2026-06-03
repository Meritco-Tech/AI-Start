# Soften Wallace Panel And Chart Colors

Date: 2026-06-03 10:52 CST

## Summary

Changed Wallace report display panels and nested cards to white backgrounds, and lowered the saturation of chart and table data-line colors.

## Changes

- Set the shared panel and nested-card background variables to `#ffffff`.
- Softened panel borders and divider lines.
- Replaced the primary, positive, risk, and secondary chart colors with lower-saturation variants.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
