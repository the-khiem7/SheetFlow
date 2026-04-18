# Concurrency And Performance Introduction

## Objective

Design a safe execution model for `SheetFlow.AppScript` that prevents race conditions, reduces timeout risk, and improves spreadsheet editing UX.

The target problems are:
- edits in `Backlogs` currently trigger heavy synchronous work on every change
- overlapping executions can reorder or overwrite data
- rapid edits can create long-running execution chains and timeouts
- users have no explicit control over when expensive refresh logic runs
- concurrent desktop and API writes can conflict because both trigger full refresh flows

## Previous State

Before the refactor, the desktop flow was:

```text
onEdit(e)
  -> BacklogService.handleEdit()
  -> BacklogService.sortAndFormat()
  -> DailyReportService.refresh()
```

Before the refactor, the mobile flow also triggered a heavy full refresh:

```text
API create/update/delete
  -> repository write
  -> RefreshService.refreshAll()
```

That model caused both desktop edits and API writes to trigger:
- full-sheet read of backlog rows
- full sorting in memory
- full range rewrite through `BacklogRepository.replaceRows(...)`
- full formatting pass
- full daily report refresh

## Current Risks

### 1. Lost updates

`replaceRows(...)` writes the entire backlog data range back into the sheet.

If execution A reads old rows, then execution B changes the sheet, and execution A later writes its old sorted snapshot, execution B's newer edit can be lost.

### 2. Overlapping executions

Apps Script can run multiple executions close together when users edit repeatedly or when API traffic overlaps with spreadsheet edits.

Without centralized locking or a dirty-queue model:
- old execution continues running
- new execution starts immediately
- both contend on the same sheet

### 3. UX degradation

Because `onEdit` performs expensive work immediately:
- users cannot edit several task dates quickly
- inserting rows in the middle of the sheet becomes stressful
- the sheet can reorder while the user is still editing

### 4. Timeout cascade

Repeated edits can spawn enough heavy runs to produce:
- long execution queues
- `Exceeded maximum execution time`
- browser freezing perception
- partial or conflicting writes

## Root Cause Summary

The system currently treats every edit as a command to execute the full maintenance pipeline immediately.

That is the wrong execution model for a spreadsheet UI.

The core design issue is not only algorithm speed. It is the absence of:
- serialized mutation control
- execution coalescing
- user-driven refresh mode
- stale-run protection

## Implemented Direction

The implementation now follows this model:

1. A centralized execution coordinator owns dirty state, revision tracking, and run tokens.
2. `onEdit` no longer runs the full maintenance pipeline synchronously.
3. Desktop edits mark the sheet dirty and return quickly.
4. Heavy work runs through a single guarded worker path in `RefreshService`.
5. Desktop users can trigger refresh explicitly from the spreadsheet menu.
6. API writes now mark dirty and attempt guarded processing through the same coordinator.
7. Stale runs abort before committing outdated writeback.

## Recommended Strategy

### Track A: Safety first

Introduce:
- `LockService` wrapper
- script-property based dirty/version markers
- execution tokens to detect stale work

### Track B: Reduce work per edit

Change `onEdit` behavior from:

```text
edit -> sort + format + daily report
```

to:

```text
edit -> mark dirty only
```

Then run heavy work via:
- manual command
- queued worker
- optional deferred trigger

### Track C: Better UX

Add an explicit control model:
- users can edit freely without immediate sheet reshuffle
- users can trigger recompute intentionally
- mobile and desktop can share a predictable refresh contract

## Scope Boundaries

This planning scope covers:
- desktop spreadsheet flow
- API-triggered refresh flow
- repository/service/runtime coordination
- operational safety and UX

This planning scope does not assume:
- a new external database
- a move away from Google Sheets
- background workers outside Apps Script

## Delivered Components

The implementation now includes:
- a `LockRepository` wrapper around `LockService`
- `ExecutionStateRepository` for dirty/revision/running-token persistence
- `ExecutionCoordinatorService` for guarded run lifecycle
- lightweight dirty-only `onEdit`
- manual refresh from spreadsheet UI
- guarded refresh execution through `RefreshService.processDirty(...)`
- stale-run cancellation before backlog/report writeback
- explicit API endpoints for refresh control and execution status
