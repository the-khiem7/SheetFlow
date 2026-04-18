# SheetFlow - Project Overview

## Introduction

SheetFlow is a backlog management, task tracking, and daily reporting system built on top of Google Sheets and Google Apps Script. The codebase is versioned in GitHub and deployed with `clasp`.

The project behaves like a lightweight workflow engine and spreadsheet-backed data pipeline:
- desktop users work directly inside Google Sheets
- the Apps Script project orchestrates sorting, formatting, and report generation
- mobile clients consume a small HTTP API exposed by the same Apps Script backend

## Current Features

- Auto-sort `Backlogs` when users edit the sheet
- Sort order: pinned -> work date -> status -> priority -> project A-Z
- Auto border grouping for pinned / no-date / date-group transitions
- Auto alignment for the backlog grid
- Daily report matrix generation into `Daily Report!E:F`
- Daily report message generation into `Backlogs!K2`
- Manual `refreshAll()` for recovery or forced recompute
- HTTP API for task and daily report reads

## Daily Report Message

The daily report feature now has two stages:

1. Build the structured daily report matrix in the `Daily Report` sheet.
2. Compose a final chat-ready message and write it into `Backlogs!K2`.

### Runtime Rule

The final message uses execution time to choose the base report date:
- before `09:00`: use yesterday as `dayA`
- from `09:00` onward: use today as `dayA`

Then:
- `dayB = dayA + 1 day`

### Source Mapping

The final message is composed from the `Daily Report` sheet:
- `F(dayA)` -> completed work section
- `E(dayB)` -> today plan section

### Output Target

- sheet: `Backlogs`
- cell: `K2`
- type: single multiline string

## Backend Surface

The Apps Script backend currently exposes:
- `GET /?path=tasks`
- `GET /?path=reports/daily`

Authentication is handled by API key validation in `ApiAuth`.

### `reports/daily` response shape

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-15",
      "goals": "1. Project A\n- Task 1",
      "finished": "1. Project A\n- Task Done 1"
    }
  ]
}
```

Notes:
- `goals` is sourced from `Daily Report!E`
- `finished` is sourced from `Daily Report!F`
- this endpoint returns raw report blocks, not the final chat-ready message in `Backlogs!K2`

## System View

```text
Backlogs Sheet
    -> Desktop flow via onEdit / refreshAll
    -> Apps Script backend
    -> Repositories + Domain + Services
    -> Daily Report sheet
    -> Final message written back to Backlogs!K2

Flutter Mobile
    -> HTTP API
    -> Apps Script backend
```

## Tech Stack

- Google Sheets - UI and persistent storage
- Google Apps Script (V8) - backend runtime
- `clasp` - local development and deployment
- GitHub - source control
- GitHub Actions - CI/CD

## Deployment

```text
git push -> GitHub Actions -> clasp push -> Apps Script updated
```

## Future API Direction

The current implementation keeps the final message as a spreadsheet-side artifact only.

If mobile clients need the final message directly, the natural follow-up is:
- `GET /?path=reports/daily-message`

That endpoint is not part of the current contract yet.
