# SHEETFLOW – Project Knowledge Base

## Overview

**SheetFlow** là một hệ thống quản lý backlog, task tracking và daily report chạy hoàn toàn trên **Google Sheets + Google Apps Script**, với mã nguồn được quản lý bằng **GitHub + clasp**.

Hệ thống hoạt động như một **mini workflow engine** và **data pipeline** trên Google Sheets.

---

# 1. System Architecture

## Conceptual Architecture

```text
Backlogs Sheet (Database Table)
        ↓
Apps Script Backend
        ↓
Sort + Format + Group
        ↓
Daily Report Sheet (Materialized View)
```

## Software Architecture (Service Layer)

```text
onEdit Trigger
    ↓
BacklogService
    ↓
FormatService
    ↓
DailyReportService
    ↓
Utils
```

## Layers

| Layer               | Responsibility                      |
| ------------------- | ----------------------------------- |
| CONFIG              | Sheet structure, columns, constants |
| Event Handler       | onEdit trigger                      |
| BacklogService      | Sorting backlog                     |
| FormatService       | Borders, alignment                  |
| DailyReportService  | Build daily report                  |
| Utils               | Date, trim, range helpers           |
| Queue/Lock (future) | Concurrency control                 |

---

# 2. Sheets Data Model

## Backlogs Sheet (Main Database)

Columns:

| Column | Field     | Description      |
| ------ | --------- | ---------------- |
| A      | Project   | Project name     |
| B      | Task      | Task description |
| C      | Priority  | Priority level   |
| D      | Status    | Ready / Finished |
| E      | Work Date | Date to execute  |
| F      | Note      | Additional note  |

Backlogs sheet hoạt động như:

```text
Task Database Table
```

---

## Daily Report Sheet

Columns:

| Column | Field                                               |
| ------ | --------------------------------------------------- |
| A      | Date                                                |
| B      | Check-in                                            |
| C      | Check-out                                           |
| D      | Total Hours                                         |
| E      | Daily Goals (All tasks grouped by project)          |
| F      | Tasks Completed (Finished tasks grouped by project) |

Daily Report sheet là:

```text
Materialized View / Aggregated Report
```

---

# 3. Data Flow

## Flow when user edits Backlogs

```text
User edits Backlogs
        ↓
onEdit Trigger
        ↓
BacklogService.sort()
        ↓
FormatService.applyBorders()
        ↓
FormatService.applyAlignment()
        ↓
DailyReportService.refresh()
        ↓
Daily Report updated
```

---

# 4. Sorting Rules (Backlogs)

Backlogs được sort theo thứ tự:

```text
1. Work Date (E)        Descending
2. Status (D)           Descending
3. Priority (C)         Ascending
4. Project (A)          A → Z
```

Pseudo:

```javascript
SORT_RULES = [
  { column: 5, ascending: false },
  { column: 4, ascending: false },
  { column: 3, ascending: true },
  { column: 1, ascending: true }
]
```

---

# 5. Daily Report Generation Logic

Daily report được build từ Backlogs theo logic:

## Group by:

```text
Date → Project → Tasks
```

## Example output format:

```text
1. Project A
- Task 1
- Task 2
- Task 3
2. Project B
- Task 4
- Task 5
```

## Finished tasks:

Filter:

```text
Status == "Finished"
```

---

# 6. Formatting Rules

## Borders

Sheet Backlogs có border để phân tách theo ngày.

Logic:

```text
If current row date != previous row date
    Draw top border
```

Border style:

```text
SOLID_MEDIUM
```

---

## Alignment

| Column | Alignment |
| ------ | --------- |
| A      | Center    |
| B      | Left      |
| C      | Center    |
| D      | Center    |
| E      | Center    |
| F      | Center    |

---

# 7. Apps Script Project Structure

Recommended structure when using clasp:

```text
src/
│
├── config.js
├── utils.js
├── format.service.js
├── backlog.service.js
├── dailyreport.service.js
├── queue.service.js
├── lock.service.js
└── main.js
```

---

# 8. Repository / Deployment Architecture

```text
Google Sheets
      ↑
Apps Script
      ↑
clasp
      ↑
Local Source Code
      ↑
GitHub Repository
      ↑
GitHub Actions (CI/CD)
```

Deployment flow:

```text
git push → GitHub Actions → clasp push → Apps Script updated
```

---

# 9. System Behavior Summary

The system acts like:

```text
Backlogs Sheet = Database Table
Daily Report Sheet = Aggregated View
Apps Script = Backend Service
onEdit = Event Trigger
Sort = Index
Daily Report = ETL / Aggregation
LockService = Transaction Lock
Debounce = Job Scheduler
Queue = Message Queue
```

This project is effectively:

```text
A spreadsheet-based workflow engine and reporting system.
```

---

# 10. Future Improvements (Planned)

## Performance / Concurrency

Planned features:

```text
LockService → prevent concurrent execution
CacheService → cache grouped data
Debounce → reduce refresh frequency
Edit Queue → batch edits
Partial refresh → refresh only affected dates
Batch formatting → reduce API calls
```

---

# 11. Key Concepts for Agents

Coding agents working on this project must understand:

```text
1. Backlogs sheet is the source of truth
2. Daily Report is generated from Backlogs
3. Sorting must always happen before generating reports
4. Formatting must be applied after sorting
5. Daily report groups tasks by Date → Project
6. Finished tasks are filtered by Status column
7. Script must avoid concurrency issues
8. All sheet structure is defined in CONFIG
9. Services should not access sheet layout directly
10. Always use Utils for date comparison and trimming
```