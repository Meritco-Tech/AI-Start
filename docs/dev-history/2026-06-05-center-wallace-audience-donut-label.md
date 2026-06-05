# 2026-06-05 13:28 CST - Center Wallace Audience Donut Label

## Request Summary

Center the selected-zone customer structure donut label text and make the percentage text slightly smaller.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`

## Implementation Notes

- Added selected-zone-only centering rules for the donut inner label container.
- Reduced the selected-zone donut percentage font size from `18px` to `17px`.
- Kept changes scoped under `.zone-focused-analysis-grid` to avoid changing all-region views.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser stylesheet check on `http://localhost:5175/wallace-reports` confirmed:
  - The selected-zone donut inner label uses `align-content: center`.
  - The selected-zone donut inner label uses `justify-items: center`.
  - The selected-zone donut percentage uses `font-size: 17px`.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
