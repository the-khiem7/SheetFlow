# Daily Report Message Source Code Guide

## Target Modules

Existing modules involved:
- `src/services/daily-report.service.gs`
- `src/repositories/daily-report.repository.gs`
- `src/repositories/backlog.repository.gs`
- `src/config/sheet.schema.gs`
- `src/config/app.config.gs`

Planned new module:
- `src/domain/daily-report-message.builder.gs`

## Responsibility Split

### `DailyReportService`
- orchestrates refresh flow
- keeps existing matrix refresh behavior
- triggers final message generation and writeback

### `DailyReportRepository`
- reads report rows from `Daily Report`
- exposes lookup by report date

### `BacklogRepository`
- writes the final composed message into `Backlogs!K2`

### `DailyReportMessageBuilder`
- resolves `dayA` and `dayB`
- formats dates for display
- composes the final message template

## Module Diagram

```mermaid
classDiagram
    class DesktopEntry {
      +onEdit(e)
      +refreshAll()
    }

    class RefreshService {
      +refreshAll()
    }

    class DailyReportService {
      +refresh()
      +refreshMessage()
    }

    class DailyReportRepository {
      +getReportDates()
      +getReports()
      +findByDate(dateKey)
    }

    class BacklogRepository {
      +getRows()
      +writeDailyMessage(message)
    }

    class DailyReportBuilder {
      +buildOutputs(reportDates, backlogRows)
    }

    class DailyReportMessageBuilder {
      +resolveBaseDates(now)
      +buildMessage(input)
      +formatDisplayDate(date)
    }

    class SpreadsheetRepository {
      +getSheetByName(name)
      +getRange(sheet,row,col,numRows,numCols)
      +getValues(range)
      +setValue(range,value)
    }

    DesktopEntry --> DailyReportService
    RefreshService --> DailyReportService
    DailyReportService --> DailyReportBuilder
    DailyReportService --> DailyReportRepository
    DailyReportService --> BacklogRepository
    DailyReportService --> DailyReportMessageBuilder
    DailyReportRepository --> SpreadsheetRepository
    BacklogRepository --> SpreadsheetRepository
```

## Refresh Sequence

```mermaid
sequenceDiagram
    participant User
    participant DesktopEntry
    participant DailyReportService
    participant DailyReportRepository
    participant DailyReportBuilder
    participant DailyReportMessageBuilder
    participant BacklogRepository

    User->>DesktopEntry: onEdit(e) or refreshAll()
    DesktopEntry->>DailyReportService: refresh()
    DailyReportService->>DailyReportRepository: getReportDates()
    DailyReportService->>DailyReportBuilder: buildOutputs(reportDates, backlogRows)
    DailyReportService->>DailyReportRepository: writeOutputs(...)
    DailyReportService->>DailyReportRepository: getReports() / findByDate(...)
    DailyReportService->>DailyReportMessageBuilder: resolveBaseDates(now)
    DailyReportService->>DailyReportMessageBuilder: buildMessage(...)
    DailyReportService->>BacklogRepository: writeDailyMessage(message)
```

## Data Flow

```mermaid
flowchart TD
    A[Backlogs sheet] --> B[Existing daily matrix refresh]
    B --> C[Daily Report E/F]
    C --> D[Read F for dayA]
    C --> E[Read E for dayB]
    D --> F[DailyReportMessageBuilder]
    E --> F
    F --> G[Final formatted message]
    G --> H[Backlogs K2]
```

## Core Logic Notes

### Date resolution

Recommended behavior:
- if current time is before `09:00`, use yesterday as `dayA`
- otherwise use today as `dayA`
- derive `dayB` from `dayA + 1 day`

### Section mapping

The final message uses:
- `completedText = report(dayA).finished`
- `todayText = report(dayB).goals`

This mapping must stay explicit in code because the source columns are intentionally asymmetric.

### Write target

The final string should be written to a single cell:
- sheet: `Backlogs`
- cell: `K2`

This location must be defined in schema/config, not repeated inline.

## Suggested Function Shape

```text
DailyReportService.refresh()
  -> refreshDailyMatrix()
  -> refreshDailyMessage(now)

DailyReportMessageBuilder.resolveBaseDates(now)
  -> { dayA, dayB, cutoffHour }

DailyReportMessageBuilder.buildMessage({
  dayA,
  dayB,
  completedText,
  todayText,
  spreadsheetUrl
})
  -> finalMessage
```

## Test Surface

Functions that should remain easy to test:
- base date resolution
- display date formatting
- message template composition
- empty-section fallback behavior
