# Concurrency And Performance Source Code Guide

## Relevant Existing Modules

- `src/app/desktop.entry.gs`
- `src/services/backlog.service.gs`
- `src/services/refresh.service.gs`
- `src/services/daily-report.service.gs`
- `src/repositories/backlog.repository.gs`
- `src/repositories/script-properties.repository.gs`
- `src/api/tasks.gs`
- `src/api/router.gs`

## Current Problematic Flow

```mermaid
sequenceDiagram
    participant User
    participant OnEdit
    participant BacklogService
    participant BacklogRepository
    participant DailyReportService

    User->>OnEdit: edit cell in Backlogs
    OnEdit->>BacklogService: handleEdit(sheet, e)
    BacklogService->>BacklogRepository: getRows()
    BacklogService->>BacklogRepository: replaceRows(sortedRows)
    BacklogService->>BacklogRepository: formatting operations
    OnEdit->>DailyReportService: refresh()
```

Problems in this flow:
- one edit causes full recomputation
- overlapping executions can both read and write the same sheet snapshot
- full-range writeback increases lost-update risk

## Proposed Architecture

### New modules

Implemented additions:
- `src/services/execution-coordinator.service.gs`
- `src/repositories/lock.repository.gs`
- `src/repositories/execution-state.repository.gs`

### Responsibility split

#### `ExecutionCoordinatorService`
- acquire execution lock
- mark dirty state
- assign and compare run tokens
- decide whether to process, skip, or abort

#### `ExecutionStateRepository`
- persist dirty flags
- persist revision / generation numbers
- persist current run metadata

#### `LockRepository`
- wrap `LockService`
- expose lock acquisition and release in one place

#### `RefreshService`
- become the only heavy processing entrypoint
- consume coordinator decisions instead of running unguarded

## Target Interaction Model

```mermaid
classDiagram
    class DesktopEntry {
      +onOpen()
      +onEdit(e)
      +refreshAll()
    }

    class ApiTasks {
      +createTask(...)
      +updateTask(...)
      +deleteTask(...)
    }

    class ExecutionCoordinatorService {
      +markDirty(context)
      +beginRun(reason)
      +finishRun(result)
      +abortIfStale(runToken)
    }

    class ExecutionStateRepository {
      +getDirtyState()
      +setDirtyState(state)
      +nextRevision()
      +getCurrentRevision()
    }

    class LockRepository {
      +tryAcquire(lockName, timeoutMs)
      +release(lock)
    }

    class RefreshService {
      +refreshAll()
      +processDirty(reason)
    }

    DesktopEntry --> ExecutionCoordinatorService
    ApiTasks --> ExecutionCoordinatorService
    RefreshService --> ExecutionCoordinatorService
    ExecutionCoordinatorService --> ExecutionStateRepository
    ExecutionCoordinatorService --> LockRepository
```

## Recommended Sequence

### Desktop edit flow

```mermaid
sequenceDiagram
    participant User
    participant DesktopEntry
    participant ExecutionCoordinator
    participant ExecutionState

    User->>DesktopEntry: edit backlog cell
    DesktopEntry->>ExecutionCoordinator: markDirty(editContext)
    ExecutionCoordinator->>ExecutionState: increment revision / dirty flag
    DesktopEntry-->>User: return quickly
```

### Manual refresh flow

```mermaid
sequenceDiagram
    participant User
    participant RefreshService
    participant ExecutionCoordinator
    participant BacklogService
    participant DailyReportService

    User->>RefreshService: manual refresh
    RefreshService->>ExecutionCoordinator: beginRun("manual")
    ExecutionCoordinator-->>RefreshService: runToken
    RefreshService->>BacklogService: sort and format
    RefreshService->>ExecutionCoordinator: abortIfStale(runToken)
    RefreshService->>DailyReportService: refresh
    RefreshService->>ExecutionCoordinator: finishRun(result)
```

### Overlapping execution protection

```mermaid
sequenceDiagram
    participant RunA
    participant RunB
    participant ExecutionState

    RunA->>ExecutionState: snapshot revision = 10
    RunB->>ExecutionState: increment revision to 11
    RunA->>ExecutionState: compare current revision
    ExecutionState-->>RunA: stale
    RunA-->>RunA: abort before writeback
```

## Key Refactor Points

### `DesktopEntry.onEdit()`

Current:
- directly triggers heavy backlog sort and daily report refresh

Target:
- validate edit range
- mark dirty
- return quickly

### `RefreshService.refreshAll()`

Current:
- directly runs heavy work

Target:
- become the single controlled path for heavy work
- only run through coordinator lock + stale checks
- expose a guarded worker path via `processDirty(...)`

### `ApiTasks`

Current:
- create/update/delete immediately call `RefreshService.refreshAll()`

Target:
- write task data
- mark dirty and attempt coordinated processing
- avoid bypassing the concurrency model

## Suggested Persistent State

Store in script properties:
- `BACKLOG_DIRTY=true|false`
- `BACKLOG_REVISION=<number>`
- `BACKLOG_LAST_RUN_AT=<timestamp>`
- `BACKLOG_LAST_RUN_REASON=<manual|api|desktop>`
- `BACKLOG_RUNNING_TOKEN=<token>`

## Notes On Performance

Primary performance gain should come from execution model changes, not micro-optimizations.

The most important wins are:
- fewer heavy runs
- one serialized worker at a time
- fewer full-range rewrites
- fewer repeated formatting calls
