# Enhance Wallace Scatter And Combo Visual

Date: 2026-06-03 14:01 CST

## Summary

Enhanced the Wallace province quadrant scatter plot and redesigned the high-frequency combo structure panel into a more visual progress-row layout.

## Changes

- Added profit-rate labels beside each province scatter marker.
- Increased the scatter marker size range so revenue differences are more visible.
- Added a `maxTopComboRevenue` scale for top combo structure rows.
- Replaced the plain high-frequency combo table with structure rows that include combo code, quadrant/channel context, revenue/price text, and a revenue progress bar.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
- Checked in Browser: 24 province points with profit labels, marker sizes from 12px to 34px, and 6 high-frequency combo progress rows.
