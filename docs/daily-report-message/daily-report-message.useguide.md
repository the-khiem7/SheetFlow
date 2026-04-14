# Daily Report Message Use Guide

## Audience

This document is for mobile developers and maintainers who need to understand how the Apps Script backend currently behaves around tasks and reports.

## Current Backend Surface

The backend is a Google Apps Script web app with two active API routes:
- `GET /?path=tasks`
- `GET /?path=reports/daily`

Authentication is handled by API key validation in `ApiAuth`.

## Endpoint: Daily Reports

### Request

```http
GET /exec?path=reports/daily&apiKey=<YOUR_API_KEY>
```

### Response Shape

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

### Notes

- `date` is returned as a normalized internal key, currently aligned with `Utils.toDateKey(...)`
- `goals` comes from column `E` of the `Daily Report` sheet
- `finished` comes from column `F` of the `Daily Report` sheet
- this endpoint returns raw daily report blocks, not the final chat-ready message

## Spreadsheet-Side Daily Message Flow

The approved feature in this scope does not add a new API endpoint yet.

Instead, the backend will:
1. refresh the `Daily Report` matrix
2. resolve the execution-time date rule
3. compose the final message from two report dates
4. write the result to `Backlogs!K2`

## Composition Contract

### Runtime rule

Given `now`:
- if `now < 09:00`, then `dayA = yesterday`
- else `dayA = today`

Then:
- `dayB = dayA + 1 day`

### Source contract

The final message uses:
- `Daily Report!F` for `dayA`
- `Daily Report!E` for `dayB`

Semantically:
- `F(dayA)` becomes `Nội dung đã thực hiện`
- `E(dayB)` becomes `Công việc hôm nay`

### Output contract

Target:
- sheet: `Backlogs`
- cell: `K2`

Value type:
- single multiline string

## Final Message Example

```text
Chúc mọi người buổi sáng tốt lành. Em xin gửi báo cáo công việc ngày 15/04/2026

Nội dung đã thực hiện:
1. Project A
- Fix sync bug
2. Project B
- Refactor sheet mapper

Công việc hôm nay (16/04/2026):
1. Project A
- Add validation for daily report output

Link Worklog & Backlogs của em:
https://docs.google.com/spreadsheets/d/19FXDXrVGvuTdDbnfO1hTID3lFRZDPaqEWUTfOyhYNLw/edit?usp=sharing
```

## Mobile Integration Guidance

Today, mobile clients should treat the system like this:
- use `reports/daily` when raw report blocks are enough
- do not assume a public API exists for the final chat-ready message
- if mobile needs the final message directly, plan a follow-up endpoint such as `GET /?path=reports/daily-message`

## Proposed Future API Contract

This is not part of the current implementation, but it is the most natural extension.

### Request

```http
GET /exec?path=reports/daily-message&apiKey=<YOUR_API_KEY>
```

### Example Response

```json
{
  "success": true,
  "data": {
    "dayA": "2026-04-15",
    "dayB": "2026-04-16",
    "message": "Chúc mọi người buổi sáng tốt lành. Em xin gửi báo cáo công việc ngày 15/04/2026\n\nNội dung đã thực hiện:\n..."
  }
}
```

## Implementation Boundaries

In the current approved scope:
- the source of truth remains the spreadsheet
- no mobile-facing contract is changed
- the final formatted message is a spreadsheet-side artifact written to `Backlogs!K2`
