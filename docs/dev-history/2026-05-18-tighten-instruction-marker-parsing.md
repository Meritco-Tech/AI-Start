# Tighten Instruction Marker Parsing

## Date

2026-05-18 21:25 Asia/Shanghai

## Request Summary

Restrict instruction-set analysis logic markers so only `[ 中文 ]` style markers are parsed, with one space after `[` and one space before `]`, and avoid recognizing `[""]`.

## Changed Files

- `src/views/SessionView.vue`
- `docs/dev-history/README.md`
- `docs/dev-history/2026-05-18-tighten-instruction-marker-parsing.md`

## Implementation Notes

- Updated the instruction logic parser regex to require:
  - `[ ` prefix;
  - Chinese text as the marker content;
  - ` ]` suffix;
  - no English-only, numeric-only, empty quote, or no-space markers.
- Updated the warning copy from `[ ... ]` to `[ 中文 ]`.

## Verification

- Ran `node ./node_modules/vite/bin/vite.js build --outDir /private/tmp/eidos-fe-build --emptyOutDir`.
- Ran regex checks confirming:
  - `[ 分析逻辑 ]` matches;
  - `[ 多维 度分析 ]` matches;
  - `[中文]`, `[ abc ]`, `[ "" ]`, and `[ 123 ]` do not match.

## Risks And Follow-ups

- Markers containing English letters or digits will no longer be parsed.
- Instruction files must use the exact spacing convention `[ 中文 ]`.
