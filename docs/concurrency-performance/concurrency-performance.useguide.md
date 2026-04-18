# Concurrency And Performance Use Guide

## Audience

This document is for mobile developers and maintainers who need to understand how the backend behavior may change once concurrency and refresh control are improved.

## Current API Surface

The current Apps Script web app exposes:
- `GET /?path=tasks`
- `POST /?path=tasks&method=POST`
- `POST /?path=tasks&method=PUT&id=<rowId>`
- `POST /?path=tasks&method=DELETE&id=<rowId>`
- `GET /?path=reports/daily`
- `POST /?path=refresh&method=POST`
- `GET /?path=refresh/status`

Task mutations now enter the shared execution coordinator after writing to the sheet.

## Current Behavior Contract

### Read tasks

```http
GET /exec?path=tasks&apiKey=<YOUR_API_KEY>
```

Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "project": "Project A",
      "taskName": "Fix bug",
      "priority": "High",
      "status": "Todo",
      "workDate": "2026-04-18"
    }
  ]
}
```

### Create task

```http
POST /exec?path=tasks&method=POST&apiKey=<YOUR_API_KEY>
Content-Type: application/json
```

Example body:

```json
{
  "project": "Project A",
  "taskName": "Fix bug",
  "priority": "High",
  "status": "Todo",
  "workDate": "2026-04-18",
  "note": ""
}
```

### Update task

```http
POST /exec?path=tasks&method=PUT&id=12&apiKey=<YOUR_API_KEY>
Content-Type: application/json
```

### Delete task

```http
POST /exec?path=tasks&method=DELETE&id=12&apiKey=<YOUR_API_KEY>
```

### Read daily reports

```http
GET /exec?path=reports/daily&apiKey=<YOUR_API_KEY>
```

## Refresh Endpoints

### Trigger refresh explicitly

```http
POST /exec?path=refresh&method=POST&apiKey=<YOUR_API_KEY>
```

Example response:

```json
{
  "data": {
    "accepted": true,
    "reason": "completed",
    "revision": 42
  }
}
```

### Read execution status

```http
GET /exec?path=refresh/status&apiKey=<YOUR_API_KEY>
```

Example response:

```json
{
  "data": {
    "dirty": true,
    "running": false,
    "revision": 42,
    "lastRunAt": "2026-04-18T09:20:00Z",
    "lastRunReason": "manual"
  }
}
```

## Mutation Semantics

Task writes now follow this contract:
- write the row immediately
- mark execution state as dirty
- attempt a guarded processing run through the coordinator
- if the worker is locked or stale, the dirty state remains for a later refresh

This means a successful write still means the row write succeeded, but derived views may be eventually consistent until the next successful guarded refresh.

## Mobile Integration Guidance

During and after the refactor, mobile clients should follow these assumptions:
- a successful write means the row write succeeded
- it may not mean all derived views were recomputed immediately
- clients should tolerate eventual consistency for reports
- clients can call `POST /?path=refresh&method=POST` intentionally when they need an explicit refresh
- clients can inspect `GET /?path=refresh/status` for observability

## UX Guidance For Spreadsheet Users

Target UX after implementation:
- users can edit many rows quickly without immediate reorder
- users can trigger refresh intentionally
- old background runs should not overwrite newer edits

## Compatibility Notes

The implementation preserves:
1. existing task read contracts
2. existing task mutation request/response shapes
3. existing daily report read endpoint

The main change is execution semantics behind the scenes, plus the addition of refresh/status endpoints for explicit control.
