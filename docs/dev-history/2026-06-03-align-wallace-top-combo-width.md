# Align Wallace Top Combo Width

Date: 2026-06-03 11:01 CST

## Summary

Adjusted the "高频套餐结构" panel width to match the "高收低利差异定位" panel above it.

## Changes

- Changed the large-screen quadrant wide-grid right column from a one-third split to a calculated width matching the previous row's `1.15fr` third column.
- Kept the medium breakpoint aligned with the previous row's two-column layout so the panel widths still match when the upper row wraps.
- Kept the single-column mobile fallback unchanged.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
