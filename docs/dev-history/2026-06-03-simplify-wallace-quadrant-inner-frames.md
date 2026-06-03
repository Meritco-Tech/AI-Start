# Simplify Wallace Quadrant Inner Frames

Date: 2026-06-03 10:56 CST

## Summary

Removed the top data-source eyebrow, simplified nested grouping frames in the quadrant-analysis section, and adjusted the high-frequency combo structure panel to occupy one third of the row.

## Changes

- Removed the "本地 CSV 数据源" eyebrow from the Wallace report header.
- Changed the combo-channel and high-frequency structure layout from `1.25fr 1fr` to `2fr 1fr`.
- Removed borders, filled backgrounds, and padding from the combo-channel quadrant groups, province quadrant groups, and regional diagnostic dimension groups.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
