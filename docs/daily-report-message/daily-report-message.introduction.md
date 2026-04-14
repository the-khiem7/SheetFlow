# Daily Report Message Introduction

## Objective

Implement a preformatted daily report message inside `SheetFlow.AppScript`.

The feature must:
- read source data from the `Daily Report` sheet
- choose report dates based on the script execution time
- compose a human-readable message in a fixed template
- write the final message into `Backlogs!K2`

## Business Rules

The runtime date selection is time-sensitive:
- before `09:00`: use yesterday as `dayA`
- from `09:00` onward: use today as `dayA`

The report content is resolved as:
- `Completed section` from `Daily Report!F:n` where the row date is `dayA`
- `Today section` from `Daily Report!E:n` where the row date is `dayB`

Current implementation assumes:
- `dayB = dayA + 1 day`
- the script runs in the Apps Script spreadsheet timezone

The final output format is:

```text
Chúc mọi người buổi sáng tốt lành. Em xin gửi báo cáo công việc ngày dd/mm/yyyy

Nội dung đã thực hiện:
<n>.Title
- content

Công việc hôm nay (dd/mm/yyyy):
<n>.Title
- content

Link Worklog & Backlogs của em:
https://docs.google.com/spreadsheets/d/19FXDXrVGvuTdDbnfO1hTID3lFRZDPaqEWUTfOyhYNLw/edit?usp=sharing
```

## Current Codebase State

`SheetFlow.AppScript` already has a layered structure:
- `config/` for sheet schema and app constants
- `repositories/` for spreadsheet access
- `domain/` for pure formatting and transformation logic
- `services/` for orchestration
- `app/` for Apps Script entrypoints
- `api/` for mobile-facing HTTP handlers

Relevant existing modules:
- `src/domain/daily-report.builder.gs`
- `src/repositories/daily-report.repository.gs`
- `src/repositories/backlog.repository.gs`
- `src/services/daily-report.service.gs`
- `src/app/desktop.entry.gs`
- `src/services/refresh.service.gs`
- `src/api/reports.gs`

## Current Behavior

The current system already generates daily report matrix data:
- source: `Backlogs`
- output sheet: `Daily Report`
- output columns:
  - `E` for planned goals
  - `F` for finished tasks

This means the new feature is not a replacement of the current daily report flow.
It is a second-stage composition flow that reuses the existing `Daily Report` sheet as a source of truth for the final message.

## Implementation Direction

The implementation should extend the current design, not bypass it.

Recommended direction:
- keep `DailyReportService.refresh()` as the orchestration entrypoint
- keep `DailyReportRepository` responsible for reading daily report rows
- keep `BacklogRepository` responsible for writing to `Backlogs!K2`
- add a new domain builder dedicated to final message composition
- keep date resolution logic explicit and testable

## Expected Deliverables

The implementation should deliver:
- one new message builder in `domain/`
- repository helpers for reading report-by-date and writing target cell output
- service orchestration that writes `Backlogs!K2`
- manual test coverage in the Apps Script test folder
- documentation for architecture, roadmap, and mobile/backend usage

## Non-Goals

This iteration does not require:
- changing the current backlog sorting flow
- expanding the A:G backlog data range
- replacing the existing `reports/daily` endpoint response shape
- introducing a time-driven trigger unless explicitly requested later
