# Product Requirements

## Product Goal

Enterprise EIDOS Frontend provides an enterprise AI decision workspace where users can run analysis, review AI-generated reports, manage conversation context, and work with uploaded files.

## Primary Users

- Enterprise decision makers.
- Analysts preparing strategic reports.
- Administrators who will manage workspace configuration in future modules.

## Core Experiences

### Workspace

The `/home` route presents:

- dock navigation;
- topic/search/analyst sidebar;
- report panel;
- chat panel;
- AI analysis session integration.

### Sessions

The `/sessions` route presents:

- left file list with local upload entry point;
- right chat experience with conversation history area and bottom composer;
- 1:3 file-to-chat width ratio;
- styling consistent with the workspace shell.

### Notifications

`/notice` is currently a placeholder for system messages, task reminders, and collaboration updates.

### Administration

`/admin` is currently a placeholder for member permissions, workspace settings, and data-source management.

## Non-Goals In This Repository

- Backend orchestration.
- Database migrations.
- Authentication implementation.
- Production deployment infrastructure beyond frontend build checks.

## UX Principles

- Keep operational screens dense, calm, and scannable.
- Prefer direct controls over explanatory marketing copy.
- Preserve existing navigation and layout conventions.
- Make API failures understandable without breaking the page.

