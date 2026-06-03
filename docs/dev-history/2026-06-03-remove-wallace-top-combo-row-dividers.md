# Remove Wallace Top Combo Row Dividers

- Date: 2026-06-03 14:07 CST
- Request: Remove row separators from the high-frequency combo structure panel.

## Changes

- Removed the bottom border from `.structure-flow-row` so the "高频套餐结构" list reads as a cleaner visual-flow panel without horizontal row dividers.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
