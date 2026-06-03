# Position Wallace Province Scatter

Date: 2026-06-03 13:53 CST

## Summary

Changed the Wallace province quadrant matrix so province points are placed by their relative income and profit-rate position inside each quadrant instead of appearing as vertical lists.

## Changes

- Added per-quadrant relative position calculation for province revenue and profit rate.
- Positioned province markers with `left` and `bottom` percentages inside each quadrant cell.
- Kept marker size tied to revenue scale and preserved province labels.

## Verification

- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test server/__tests__/*.test.js`
- Passed: `/Users/wentaoding/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build`
- Checked in Browser: 24 scatter points render with 18 distinct horizontal positions and 17 distinct vertical positions.
