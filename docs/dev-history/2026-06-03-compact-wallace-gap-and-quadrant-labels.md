# Compact Wallace Gap Panel And Quadrant Labels

- Date: 2026-06-03 14:07 CST
- Request: Tighten the high-income low-profit gap panel and make province quadrant labels lighter.

## Changes

- Removed the row separators from the "高收低利差异定位" list and reduced each row's minimum height so the panel reads more compactly.
- Changed the province scatter quadrant names to small, light-gray labels so they act as contextual anchors instead of competing with the data points.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
