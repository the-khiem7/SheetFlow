# Daily Report Message Roadmap

## Status Overview

Feature scope:
- project: `SheetFlow.AppScript`
- runtime target: Apps Script spreadsheet flow
- output target: `Backlogs!K2`

Resume rule:
- this file is the single source of truth for implementation progress
- each phase should be updated as soon as work lands

## Phase 1: Confirm Source Contracts

Status: `approved`

Tasks:
- [x] Confirm existing daily report generation already writes `Daily Report!E:F`
- [x] Confirm final output target is `Backlogs!K2`
- [x] Confirm time rule for `dayA`
- [x] Confirm source mapping:
  - `F(dayA)` for completed work
  - `E(dayB)` for today work
- [x] Confirm docs must be written in English

Notes:
- current assumption is `dayB = dayA + 1 day`
- no time-driven trigger is included in this scope

## Phase 2: Schema And Config Preparation

Status: `completed`

Tasks:
- [x] Add schema constants for `Backlogs!K2`
- [x] Add config constants for report cutoff hour
- [x] Add config constants for fixed spreadsheet link
- [x] Keep all new coordinates centralized, with no scattered hardcoded ranges

Done when:
- output cell and runtime constants are defined in config files

## Phase 3: Domain Logic

Status: `completed`

Tasks:
- [x] Create a dedicated message builder in `src/domain/`
- [x] Add deterministic date resolution logic for `dayA` and `dayB`
- [x] Add `dd/mm/yyyy` formatter for user-facing text
- [x] Compose the final message from completed and planned sections
- [x] Handle empty section fallback without breaking the template

Done when:
- the builder can generate the final report message from plain inputs only

## Phase 4: Repository Integration

Status: `completed`

Tasks:
- [x] Extend `DailyReportRepository` with report lookup by date
- [x] Extend `BacklogRepository` with single-cell write for `K2`
- [x] Reuse `SpreadsheetRepository` helpers instead of calling sheet APIs directly

Done when:
- services can read report rows by date and write the final message without direct sheet calls

## Phase 5: Service Orchestration

Status: `completed`

Tasks:
- [x] Extend `DailyReportService.refresh()` with message generation
- [x] Keep existing matrix refresh behavior unchanged
- [x] Write the composed text into `Backlogs!K2`
- [x] Preserve current `DesktopEntry.onEdit()` and `RefreshService.refreshAll()` integration points

Done when:
- one refresh action updates both `Daily Report` matrix data and the final message cell

## Phase 6: Validation

Status: `completed`

Tasks:
- [x] Add manual tests for before `09:00`
- [x] Add manual tests for after `09:00`
- [x] Add manual tests for missing `dayA`
- [x] Add manual tests for missing `dayB`
- [x] Add manual tests for full message formatting

Done when:
- Apps Script test utilities can validate the critical scenarios

## Phase 7: Optional API Follow-Up

Status: `out_of_scope`

Tasks:
- [ ] Add `GET reports/daily-message`
- [ ] Return composed message directly for mobile clients

Notes:
- this is intentionally excluded from the current implementation
- it can be picked up later if mobile needs the final text instead of raw report rows

## Risks And Decisions

Known risks:
- timezone mismatch between user expectation and spreadsheet timezone can shift `dayA`
- missing rows in `Daily Report` can create partial reports
- hardcoding link text outside config would reduce maintainability

Design decisions:
- reuse `Daily Report` as the source of truth
- keep formatting in `domain/`, not in service or repository layers
- keep spreadsheet read/write responsibilities inside repositories

## Resume Checklist

Start here when resuming:
1. Check `src/services/daily-report.service.gs`
2. Check `src/repositories/daily-report.repository.gs`
3. Check `src/repositories/backlog.repository.gs`
4. Implement the new builder in `src/domain/`
5. Update this roadmap after every completed phase
