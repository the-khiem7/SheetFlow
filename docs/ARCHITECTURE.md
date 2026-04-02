# SheetFlow — Architecture

## Current Structure

SheetFlow.AppScript hiện dùng layered structure bên trong `src/`:

```text
src/
  app/           # Global Apps Script entrypoints
  api/           # Flutter-facing HTTP modules
  config/        # App config + sheet schema
  domain/        # Mapping, sorting, formatting, report building
  repositories/  # Spreadsheet / Script Properties access
  services/      # Desktop use-case orchestration
  shared/        # Utils, logging, response helpers
```

## Client Boundaries

### Desktop client
- User thao tác trực tiếp trên Google Sheets
- Entry points:
  - `onEdit(e)`
  - `refreshAll()`
- Flow:
  - `app/main.gs` → `DesktopEntry` → services → repositories/domain

### Flutter client
- Mobile app gọi Apps Script Web App qua HTTP
- Entry points:
  - `doGet(e)`
  - `doPost(e)`
- Flow:
  - `app/main.gs` → `ApiEntry` → `api/router.gs` → API modules → repositories/domain

## Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `config/` | Định nghĩa schema bảng, cột, row offset, app constants |
| `shared/` | Helper dùng chung như utils, logger, JSON response |
| `domain/` | Logic gần-pure: sort task, map row ↔ object, build daily report, classify border group |
| `repositories/` | Lớp duy nhất truy cập trực tiếp `SpreadsheetApp` và `PropertiesService` |
| `services/` | Orchestration cho desktop use cases |
| `api/` | Auth, route, task/report handlers cho Flutter |
| `app/` | Hàm global Apps Script |

## Data Model

### Backlogs sheet

| Column | Field | Meaning |
|---|---|---|
| A | `project` | Dự án |
| B | `task` | Tên công việc |
| C | `priority` | Mức độ ưu tiên |
| D | `status` | Trạng thái |
| E | `workDate` | Ngày thực hiện |
| F | `note` | Ghi chú |
| G | `pinned` | Pinned |

Schema này được khóa trong `config/sheet.schema.gs` và không nên hardcode rải rác ngoài file đó.

## Runtime Flow

### Desktop flow

```text
User edits Backlogs
  ↓
onEdit(e)
  ↓
DesktopEntry
  ↓
BacklogService.handleEdit()
  ↓
TaskSorter + BacklogFormatter + BacklogRepository
  ↓
DailyReportService.refresh()
  ↓
DailyReportBuilder + DailyReportRepository
```

### Flutter API flow

```text
Flutter HTTP request
  ↓
doGet / doPost
  ↓
ApiEntry
  ↓
ApiRouter
  ↓
ApiAuth + ApiTasks / ApiReports
  ↓
Repositories + Domain
```

## Daily Report Generation

Daily report vẫn group theo:

`Date → Project → Tasks`

Output cell format:

```text
1. Project A
- Task 1
- Task 2
2. Project B
- Task 3
```

Cột finished vẫn lọc theo:

`status.toLowerCase() === "finished"`

## Formatting Rules

### Borders
- So sánh theo task group:
  - `PINNED`
  - `NO_DATE`
  - `DATED_yyyy-MM-dd`
- Khi group đổi giữa 2 dòng, vẽ top border `SOLID_MEDIUM`

### Alignment

| Column | Alignment |
|---|---|
| A | Center |
| B | Left |
| C | Center |
| D | Center |
| E | Center |
| F | Center |
| G | Center |
