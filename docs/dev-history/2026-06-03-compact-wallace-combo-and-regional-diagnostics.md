# Compact Wallace Combo And Regional Diagnostics

- Date: 2026-06-03 14:14 CST
- Request: Compress the high-frequency combo structure table and remove row separators while tightening the regional supplemental diagnostics panel.

## Changes

- Reduced the high-frequency combo structure row height and tightened label spacing so the panel takes less vertical space.
- Removed province row dividers from the regional supplemental diagnostics panel.
- Changed the regional diagnostics list from space-between distribution to compact top-aligned rows, with smaller row height and padding.
- Slightly reduced the paired province-quadrant/diagnostic panel minimum height while preserving their side-by-side alignment.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
