# Coding Style

## Language And Framework

- Use Vue 3 single-file components.
- Prefer `<script setup>`.
- Use Composition API refs, computed values, and lifecycle hooks.
- Keep JavaScript modules as ES modules.

## Naming

- Components: `PascalCase.vue`.
- Route views: suffix with `View.vue`.
- Config modules: descriptive camelCase exports.
- API wrapper functions: verb-first names, for example `createSession`, `getHistory`, `uploadWorkspaceFiles`.

## Component Design

- Route-level views compose layout and data flow.
- Reusable components receive props and emit events.
- Components should not know backend endpoint URLs unless they are API boundary components, which this project currently avoids.

## Styling

- Prefer scoped CSS in the component being changed.
- Preserve the existing visual language: white surfaces, restrained purple accents, compact Element Plus controls, and 16px major panel radii.
- Do not introduce broad global CSS unless it is a reset or shared foundation.
- Avoid nested card layouts unless a repeated item, modal, or tool surface needs framing.

## API And Errors

- Use `src/api/http.js` for request construction.
- Use `src/api/eidos.js` for domain endpoints.
- Surface backend failures with `ElMessage` or local UI state.
- Do not swallow errors silently.

## Data Safety

- Never commit real credentials.
- Never hard-code private tokens.
- Use `.env.example` for variable names and safe placeholder values.

