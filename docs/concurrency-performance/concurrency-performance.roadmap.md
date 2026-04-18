# Concurrency And Performance Roadmap

## Status Overview

Feature area:
- desktop spreadsheet execution safety
- API concurrency safety
- refresh orchestration
- UX improvements for manual control

Resume rule:
- use this file as the implementation tracker for concurrency work

## Phase 1: Baseline Analysis

Status: `completed`

Tasks:
- [x] Document current write paths: `onEdit`, `refreshAll`, mobile create/update/delete
- [x] Measure which operations rewrite the whole backlog range
- [x] Identify all entrypoints that can overlap on the same sheet
- [x] Capture timeout and lost-update scenarios with reproducible examples

Done when:
- the team has a concrete list of overlapping execution paths and unsafe write patterns

Completed notes:
- `DesktopEntry.onEdit()` currently triggers `BacklogService.handleEdit()` and `DailyReportService.refresh()` in the same execution.
- `ApiTasks.createTask()`, `updateTask()`, and `deleteTask()` all call `RefreshService.refreshAll()` immediately after a row mutation.
- `BacklogRepository.replaceRows(...)` rewrites the entire A:G data range, which is the primary lost-update risk during overlapping executions.
- Formatting work currently loops row by row and performs repeated border operations after every sort.

## Phase 2: Centralized Execution Coordinator

Status: `completed`

Tasks:
- [x] Introduce a `LockService` wrapper in repository or service layer
- [x] Create a coordinator service for lock acquisition, dirty flags, and run tokens
- [x] Standardize execution states: `idle`, `pending`, `running`, `stale`
- [x] Define lock timeout and retry policy

Done when:
- every heavy refresh path enters through one serialized coordination layer

Completed notes:
- `LockRepository` now wraps `LockService.getDocumentLock()`.
- `ExecutionStateRepository` owns dirty/revision/running-token persistence in script properties.
- `ExecutionCoordinatorService` provides `markDirty`, `beginRun`, `abortIfStale`, and `finishRun`.
- Existing heavy paths will be migrated to this coordinator in the next phases.

## Phase 3: Lightweight OnEdit

Status: `completed`

Tasks:
- [x] Change `DesktopEntry.onEdit()` to stop calling heavy refresh logic directly
- [x] Convert `onEdit` into a lightweight `markDirty` operation
- [x] Restrict dirty marking to relevant edit ranges only
- [x] Preserve harmless early returns for non-backlog edits

Done when:
- editing cells no longer triggers full sort + format + report generation synchronously

Completed notes:
- `DesktopEntry.onEdit()` no longer invokes `DailyReportService.refresh()` directly.
- `BacklogService.handleEdit()` now only validates the edit range and marks execution state as dirty.
- Spreadsheet editing can now return quickly without an immediate full recompute.

## Phase 4: Deferred Or Manual Processing

Status: `completed`

Tasks:
- [x] Add a manual refresh entrypoint for users
- [x] Add a worker flow that processes dirty state safely
- [x] Optionally debounce worker execution via `CacheService` or a short-lived trigger strategy
- [x] Ensure multiple edits coalesce into one heavy run

Done when:
- many quick edits lead to one consolidated processing run instead of many overlapping runs

Completed notes:
- `RefreshService.processDirty(...)` is now the guarded worker path for heavy refresh work.
- `refreshAll()` now runs through the coordinator instead of bypassing it.
- Desktop users now have a spreadsheet menu entry to trigger refresh intentionally.
- Multiple quick edits coalesce naturally because `onEdit` only marks dirty while manual refresh processes the latest state once.

## Phase 5: Stale-Run Protection

Status: `completed`

Tasks:
- [x] Add monotonic revision or generation numbers in script properties
- [x] Snapshot the current revision at worker start
- [x] Abort writeback if the worker revision becomes stale before commit
- [x] Ensure old runs cannot overwrite newer edits

Done when:
- a newer edit always wins over an older execution

Completed notes:
- stale detection now compares both revision and running token
- `BacklogService` aborts before full-range rewrite and before formatting continues
- `DailyReportService` aborts before report and message writeback
- old runs now give up instead of committing stale snapshots after newer edits

## Phase 6: Reduce Write Amplification

Status: `completed`

Tasks:
- [x] Review `BacklogRepository.replaceRows(...)` for full-range overwrite risks
- [x] Avoid unnecessary rewrites when order did not change
- [x] Reduce formatting calls to batched operations only
- [x] Split data refresh from cosmetic formatting where possible

Done when:
- refreshes write less data and make fewer expensive spreadsheet calls

Completed notes:
- formatting now clears borders in one range operation instead of one row at a time
- formatting reuses the in-memory sorted snapshot instead of rereading the sheet
- alignment now uses row counts directly instead of refetching backlog rows
- full-range rewrite remains part of sorting, but stale-run protection now prevents the worst overwrite cases

## Phase 7: API Alignment

Status: `completed`

Tasks:
- [x] Make mobile create/update/delete enter the same execution coordinator
- [x] Define whether API writes trigger immediate processing or dirty-only updates
- [x] Add refresh/status endpoints if mobile needs explicit control
- [x] Preserve backward compatibility where feasible

Done when:
- desktop and API writes follow the same concurrency contract

Completed notes:
- API mutations now mark dirty through the shared coordinator and then attempt a guarded processing run.
- `POST /?path=refresh` and `GET /?path=refresh/status` now exist for explicit control and observability.
- existing task CRUD response shapes remain unchanged while refresh coordination moved behind the scenes.

## Phase 8: Validation

Status: `planned`

Tasks:
- [ ] Add tests for lock acquisition failure
- [ ] Add tests for stale-run cancellation
- [ ] Add tests for rapid sequential edits
- [ ] Add tests for overlapping API and desktop writes
- [ ] Add tests for manual refresh behavior

Done when:
- concurrency scenarios are reproducible and verified in Apps Script test flows

## Recommended Execution Order

1. Phase 1: Baseline Analysis
2. Phase 2: Centralized Execution Coordinator
3. Phase 3: Lightweight OnEdit
4. Phase 4: Deferred Or Manual Processing
5. Phase 5: Stale-Run Protection
6. Phase 6: Reduce Write Amplification
7. Phase 7: API Alignment
8. Phase 8: Validation

## Risks

Known risks:
- lock misuse can block all processing if not released safely
- time-driven or deferred triggers may complicate operational debugging
- changing `onEdit` semantics may surprise users if manual refresh UX is unclear
- mobile clients may depend on old immediate-refresh behavior

## Decisions To Confirm Before Implementation

- Should desktop default to `manual refresh` or `auto deferred refresh`?
- Is a menu button acceptable for user-triggered refresh in Google Sheets?
- Should mobile writes remain immediate, or should they also become dirty-only?
- Is eventual consistency acceptable for daily report updates?
