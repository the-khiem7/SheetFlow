# SheetFlow — Architecture

## Software Architecture (Service Layer)

```
onEdit Trigger
    ↓
BacklogService.handleEdit()
    ↓
BacklogService.sortAndFormat()
    ↓
FormatService.applyDateBorders()
FormatService.applyAlignment()
    ↓
DailyReportService.refresh()
    ↓
Utils (toDateKey, isSameDate, safeTrim, getDataRange)
```

## Layers

| Layer              | Responsibility                       |
|--------------------|--------------------------------------|
| CONFIG             | Sheet structure, columns, constants  |
| Event Handler      | onEdit trigger, routing              |
| BacklogService     | Sort + format pipeline               |
| FormatService      | Borders, alignment                   |
| DailyReportService | Build daily report from backlogs     |
| Utils              | Date, trim, range helpers            |

## Data Flow

```
User edits Backlogs
    ↓
onEdit(e) fires
    ↓
BacklogService.handleEdit(sheet, e)
    ↓
range.sort(CONFIG.BACKLOGS.SORT_RULES)
    ↓
FormatService.applyDateBorders()
FormatService.applyAlignment()
    ↓
DailyReportService.refresh()
    ↓
Daily Report updated (cột E: all tasks, cột F: finished tasks)
```

## CONFIG Structure

```javascript
const CONFIG = {
  BACKLOGS: {
    SHEET_NAME: "Backlogs",
    START_ROW: 3,
    START_COL: 1,
    NUM_COLS: 6,
    SORT_RULES: [...]
  },
  DAILY: {
    SHEET_NAME: "Daily Report",
    START_ROW: 14,
    DATE_COL: 1,
    GOALS_COL: 5,
    FINISHED_COL: 6
  }
};
```

## Daily Report Generation

Group by: `Date → Project → Tasks`

Output format trong cell E/F:
```
1. Project A
- Task 1
- Task 2
2. Project B
- Task 3
```

Filter cho cột F: `status.toLowerCase() === "finished"`

## Formatting Rules

### Borders
- Khi giá trị ngày (cột E) thay đổi giữa 2 dòng → vẽ top border `SOLID_MEDIUM`

### Alignment
| Cột | Alignment |
|-----|-----------|
| A   | Center    |
| B   | Left      |
| C   | Center    |
| D   | Center    |
| E   | Center    |
| F   | Center    |

## System Behavior Mapping

```
Backlogs Sheet    = Database Table
Daily Report      = Materialized View / Aggregated Report
Apps Script       = Backend Service
onEdit            = Event Trigger
Sort              = Index
Daily Report Gen  = ETL / Aggregation
LockService       = Transaction Lock
```
