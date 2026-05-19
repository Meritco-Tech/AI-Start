# Testing Strategy

## Current State

The project currently has no dedicated unit, component, or end-to-end test framework configured. The minimum verification gate is a production build.

## Required Checks Today

Run:

```bash
npm run build
```

If `npm` is unavailable but dependencies are installed:

```bash
node ./node_modules/vite/bin/vite.js build
```

For UI changes, also open the affected route in a browser and check:

- route renders without console errors;
- layout does not overlap at the supported viewport;
- primary controls are visible and usable;
- changed navigation state is highlighted correctly.

## When To Add Tests

Add formal tests before or alongside changes that:

- modify API request construction;
- alter chat streaming behavior;
- change route guards or navigation;
- add complex computed state;
- transform uploaded files or workspace file paths;
- fix a regression.

## Recommended Future Tooling

- Vitest for unit tests.
- Vue Test Utils for component behavior.
- Playwright for browser-level route and interaction tests.

Suggested future scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "e2e": "playwright test"
}
```

## Manual Smoke Checklist

- `/home` loads.
- `/sessions` loads.
- `/files` redirects to `/sessions`.
- Chat input accepts text and handles send errors.
- File upload list accepts local file selection.
- Build exits with code `0`.

