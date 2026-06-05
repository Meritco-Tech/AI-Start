# 2026-06-04 22:14 CST - Redesign Wallace Zone Profit Hero

## Request Summary

Remove the frame and background from the selected-zone core operating performance profit-rate hero block and optimize its visual presentation.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`

## Implementation Notes

- Removed the border, radius, and tinted background from `.zone-hero-metric`.
- Reworked the block into a lightweight transparent hero metric with a vertical gradient accent line.
- Increased the main profit-rate value size and tightened spacing for a cleaner selected-zone summary.
- Kept the change limited to the existing selected-zone core operating performance hero metric.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser stylesheet check on `http://localhost:5175/wallace-reports` confirmed the updated `.zone-hero-metric` transparent background rule is loaded.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
- The browser was on the all-region view after reload, so the selected-zone hero DOM was not present for computed-style inspection; stylesheet verification confirmed the updated rule is loaded.
