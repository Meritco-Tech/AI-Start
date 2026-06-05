# 2026-06-05 13:21 CST - Align Wallace Top Zone Dividers

## Request Summary

Align the selected-zone `核心经营表现` and `套餐与定价质量` divider heights, and move the divider position slightly lower while referencing the customer structure divider rhythm. Do not change other content.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`

## Implementation Notes

- Added a shared `120px` minimum height baseline to `.zone-hero-metric` and `.zone-pass-meter`.
- Kept the existing transparent, borderless visual style for both top metric blocks.
- Limited the change to the selected-zone top cards that contain the two requested divider lines.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser stylesheet check on `http://localhost:5175/wallace-reports` confirmed:
  - `.zone-hero-metric` uses `min-height: 120px`.
  - `.zone-pass-meter` uses `min-height: 120px`.
  - Both metric blocks use `box-sizing: border-box`.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
