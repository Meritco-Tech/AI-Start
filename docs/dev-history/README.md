# Development History

This directory stores Codex-written change-history notes for file-changing tasks.

## History Index

| Date | Change | File |
| --- | --- | --- |
| 2026-05-19 | Fixed multi-Agent progress so Agent steps update live while running. | [2026-05-19-live-multi-agent-progress.md](2026-05-19-live-multi-agent-progress.md) |
| 2026-05-19 | Changed multi-Agent workflow display to reveal Agents progressively. | [2026-05-19-progressive-multi-agent-display.md](2026-05-19-progressive-multi-agent-display.md) |
| 2026-05-19 | Added a coordinator-style multi-Agent answer mode with visible Agent progress. | [2026-05-19-add-multi-agent-mode.md](2026-05-19-add-multi-agent-mode.md) |
| 2026-05-19 | Added local file text as optional prompt context for session analysis. | [2026-05-19-add-local-file-prompt-context.md](2026-05-19-add-local-file-prompt-context.md) |
| 2026-05-19 | Improved smart search with a Chinese web-search fallback and source display. | [2026-05-19-improve-smart-search-fallback.md](2026-05-19-improve-smart-search-fallback.md) |
| 2026-05-19 | Added a default-off smart search switch with web-search prompt augmentation. | [2026-05-19-add-smart-search-toggle.md](2026-05-19-add-smart-search-toggle.md) |
| 2026-05-19 | Changed the default DeepSeek thinking mode to off. | [2026-05-19-default-thinking-mode-off.md](2026-05-19-default-thinking-mode-off.md) |
| 2026-05-18 | Split session responses into reasoning and final-answer panels. | [2026-05-18-show-reasoning-and-final-answer.md](2026-05-18-show-reasoning-and-final-answer.md) |
| 2026-05-18 | Displayed full submitted prompts and disabled dynamic answer refresh. | [2026-05-18-show-full-prompt-and-disable-dynamic-refresh.md](2026-05-18-show-full-prompt-and-disable-dynamic-refresh.md) |
| 2026-05-18 | Made local files optional for instruction-logic analysis. | [2026-05-18-make-files-optional-for-analysis.md](2026-05-18-make-files-optional-for-analysis.md) |
| 2026-05-18 | Streamed DeepSeek reasoning and answer deltas into the session UI. | [2026-05-18-stream-deepseek-reasoning.md](2026-05-18-stream-deepseek-reasoning.md) |
| 2026-05-18 | Added DeepSeek thinking mode and reasoning effort controls. | [2026-05-18-deepseek-thinking-controls.md](2026-05-18-deepseek-thinking-controls.md) |
| 2026-05-18 | Synced keyboard picker scrolling and added dynamic thinking progress while requests run. | [2026-05-18-scroll-picker-and-dynamic-thinking.md](2026-05-18-scroll-picker-and-dynamic-thinking.md) |
| 2026-05-18 | Added trailing-space logic mentions, keyboard selection, and reasoning display. | [2026-05-18-keyboard-logic-selection-and-reasoning.md](2026-05-18-keyboard-logic-selection-and-reasoning.md) |
| 2026-05-18 | Changed instruction logic selection to single-select and display the chosen logic after `@`. | [2026-05-18-single-instruction-logic-selection.md](2026-05-18-single-instruction-logic-selection.md) |
| 2026-05-18 | Tightened instruction marker parsing to only accept `[ 中文 ]` markers. | [2026-05-18-tighten-instruction-marker-parsing.md](2026-05-18-tighten-instruction-marker-parsing.md) |
| 2026-05-18 | Added instruction-set parsing, `@` logic selection, and prompt appending. | [2026-05-18-instruction-logic-mentions.md](2026-05-18-instruction-logic-mentions.md) |
| 2026-05-18 | Fixed instruction-set file upload by using the backend-accessible permanent target. | [2026-05-18-fix-instruction-file-upload-path.md](2026-05-18-fix-instruction-file-upload-path.md) |
| 2026-05-18 | Split the session page file panel into local files and instruction-set files. | [2026-05-18-split-session-file-panel.md](2026-05-18-split-session-file-panel.md) |
| 2026-05-18 | Required Codex to maintain this README's high-level history index. | [2026-05-18-dev-history-index-rule.md](2026-05-18-dev-history-index-rule.md) |
| 2026-05-18 | Removed the lower-left attachment button from the session chat composer. | [2026-05-18-remove-chat-attachment-button.md](2026-05-18-remove-chat-attachment-button.md) |
| 2026-05-18 | Added the mandatory Codex change-history rule and created this history directory. | [2026-05-18-codex-change-history-rule.md](2026-05-18-codex-change-history-rule.md) |

## Naming

Use:

```text
YYYY-MM-DD-short-task-name.md
```

Example:

```text
2026-05-18-session-markdown-rendering.md
```

## Required Sections

Each entry should include:

- date and local time;
- request summary;
- changed files;
- implementation notes;
- verification performed;
- known risks or follow-up items.

Never include secrets, API keys, private tokens, or credentials.
