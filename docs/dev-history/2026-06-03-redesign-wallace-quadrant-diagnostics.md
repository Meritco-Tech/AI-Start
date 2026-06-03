# Redesign Wallace Quadrant Diagnostics

Date: 2026-06-03 11:06 CST

## Summary

Redesigned the Wallace province quadrant and regional diagnostic panels into livelier visual forms while keeping the white, low-saturation report style.

## Changes

- Replaced the province quadrant grouped bar list with a 2x2 income/profit matrix.
- Added axis labels and revenue-sized province bubbles inside each quadrant.
- Replaced the regional diagnostic dimension lists with province-level diagnostic rows.
- Combined health risk, top-bottom profit gap, and combo margin pass rate into three mini indicators per province.
- Removed now-unused computed sort/group helpers for the old layouts.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
- Checked in Browser: 4 matrix cells, 24 province bubbles, 6 regional diagnostic rows, 18 mini indicators, and equal panel content heights.
