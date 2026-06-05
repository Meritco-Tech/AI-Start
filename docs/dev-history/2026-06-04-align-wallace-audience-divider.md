# 2026-06-04 22:06 CST - Align Wallace Audience Divider

## Request Summary

Adjust the selected-zone customer structure chart size so its horizontal divider aligns with the neighboring cost and channel margin divider, without changing other pages.

## Changed Files

- `src/views/WallaceReportView.vue`
- `docs/dev-history/README.md`

## Implementation Notes

- Added selected-zone-only sizing overrides for the customer structure portrait.
- Reduced the customer donut size, inner label size, profile row gap, and profile metadata text size.
- Fixed the selected-zone customer portrait height to match the `164px` divider baseline already used by the cost and channel margin card.
- Kept all changes scoped under `.zone-focused-analysis-grid`.

## Verification Performed

- `node ./node_modules/vite/bin/vite.js build`
- `node --test server/__tests__/wallaceReportService.test.js`
- Browser stylesheet check on `http://localhost:5175/wallace-reports` confirmed:
  - The selected-zone audience portrait `height: 164px` override is loaded.
  - The selected-zone audience donut `width: 112px` override is loaded.
  - The selected-zone audience profile metadata `font-size: 10px` override is loaded.
  - The all-region view does not have the `zone-focused-analysis-grid` class.

## Known Risks Or Follow-Up Items

- The production build still reports the existing Vite large chunk warning; it does not block the build.
- Browser verification could not programmatically switch back to selected-zone view after reload because the current browser control layer did not expose reliable Element Plus selection controls; the fix is based on the measured selected-zone mismatch before the change, where customer structure was `190px` high while cost and head-tail were `164px`.
