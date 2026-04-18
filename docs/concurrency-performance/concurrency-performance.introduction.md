# Concurrency And Performance Introduction

## Objective

Design a safe execution model for `SheetFlow.AppScript` that prevents race conditions, reduces timeout risk, and improves spreadsheet editing UX.

The target problems are:
- edits in `Backlogs` currently trigger heavy synchronous work on every change
- overlapping executions can reorder or overwrite data
- rapid edits can create long-running execution chains and timeouts
- users have no explicit control over when expensive refresh logic runs
- concurrent desktop and API writes can conflict because both trigger full refresh flows

## Current State

The current desktop flow is:

```text
onEdit(e)
  -> BacklogService.handleEdit()
  -> BacklogService.sortAndFormat()
  -> DailyReportService.refresh()
```

The current mobile flow also triggers a heavy full refresh:

```text
API create/update/delete
  -> repository write
  -> RefreshService.refreshAll()
```

This means both desktop edits and API writes can cause:
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

## Proposed Direction

The recommended implementation direction is:

1. Add a centralized execution coordinator.
2. Stop doing full heavy refresh work directly inside every `onEdit`.
3. Convert `onEdit` into a lightweight capture step that marks the sheet as dirty.
4. Process expensive work through a single serialized worker flow.
5. Add explicit manual refresh commands so users can decide when sorting and report generation should happen.
6. Add stale-run detection so older executions cannot overwrite newer state.

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

## Expected Deliverables

Implementation should eventually produce:
- a lock and execution coordinator
- dirty-state storage in script properties
- a manual refresh pathway
- debounced or queued refresh behavior
- stale-run protection
- lighter `onEdit`
- updated API and docs for mobile consumers
