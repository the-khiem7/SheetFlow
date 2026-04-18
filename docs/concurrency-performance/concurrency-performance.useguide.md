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

Today, task mutations effectively trigger a full refresh flow after writing to the sheet.

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

## Planned Contract Changes

The concurrency/performance work should keep reads stable but may evolve mutation semantics.

### Likely behavioral change

Task writes may become:
- write data immediately
- mark the sheet dirty
- defer heavy sorting/report generation to a coordinated worker or manual refresh

That means clients should not assume every mutation immediately produces fully refreshed derived views.

## Recommended Future Endpoints

These are planning targets, not implemented endpoints yet.

### Trigger refresh explicitly

```http
POST /exec?path=refresh&method=POST&apiKey=<YOUR_API_KEY>
Content-Type: application/json
```

Example body:

```json
{
  "reason": "manual"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "accepted": true,
    "mode": "queued",
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
  "success": true,
  "data": {
    "dirty": true,
    "running": false,
    "revision": 42,
    "lastRunAt": "2026-04-18T09:20:00Z",
    "lastRunReason": "manual"
  }
}
```

## Mobile Integration Guidance

During and after the refactor, mobile clients should follow these assumptions:
- a successful write means the row write succeeded
- it may not mean all derived views were recomputed immediately
- clients should tolerate eventual consistency for reports
- if explicit refresh endpoints are added, mobile should call them intentionally instead of assuming background refresh from every write

## UX Guidance For Spreadsheet Users

Target UX after implementation:
- users can edit many rows quickly without immediate reorder
- users can trigger refresh intentionally
- old background runs should not overwrite newer edits

## Compatibility Notes

The best migration path is:
1. keep current task read contracts unchanged
2. preserve current mutation request/response shapes where possible
3. add refresh/status endpoints separately
4. change heavy refresh behavior behind the scenes first

This approach reduces disruption for the mobile app while fixing the desktop execution model.
