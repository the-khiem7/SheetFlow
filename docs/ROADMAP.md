# SheetFlow - Roadmap

## Phase 0: Foundation (Done)

- [x] Basic onEdit auto-sort for `Backlogs`
- [x] Manual `sortBacklogs()` trigger
- [x] Date-group top borders
- [x] Alignment rules for backlog columns
- [x] Daily report matrix generation grouped by `Date -> Project`
- [x] Finished task filtering for the daily report
- [x] Core date/string helpers in `Utils`
- [x] Project A-Z tie-break sorting

## Phase 1: Service Layer Refactor (Done)

- [x] Centralized config layer
- [x] `BacklogService`
- [x] `DailyReportService`
- [x] `FormatService`
- [x] Shared `Utils.getDataRange(...)`
- [x] Manual `refreshAll()` entrypoint

## Phase 2: Concurrency And Performance (Not Started)

- [ ] `LockService.tryLock()` in `onEdit`
- [ ] Selective daily refresh for relevant edit columns only
- [ ] Centralized lock wrapper
- [ ] Debounce report refresh with `CacheService`
- [ ] Edit queue pattern
- [ ] Batch formatting to reduce API calls
- [ ] Partial refresh by impacted date only
- [ ] Cache grouped backlog data

## Phase 3: Multi-file Structure (Done)

- [x] Split `code.gs` into multiple files
- [x] `config.gs`
- [x] `utils.gs`
- [x] `format.service.gs`
- [x] `backlog.service.gs`
- [x] `dailyreport.service.gs`
- [x] `main.gs`

## Phase 3.5: Layered Folder Refactor (Done)

- [x] Split `src/` into `app`, `api`, `config`, `domain`, `repositories`, `services`, `shared`
- [x] Introduce `sheet.schema.gs` as the sheet source of truth
- [x] Move all `SpreadsheetApp` access into repositories
- [x] Move all `PropertiesService` access into repositories
- [x] Separate desktop flow from Flutter API flow
- [x] Normalize column F as `note`
- [x] Keep global entrypoints only in `src/app/main.gs`

## Phase 4: CI/CD (Done)

- [x] GitHub Actions workflow for `clasp push`
- [x] `CLASP_CREDENTIALS` secret setup
- [x] `SCRIPT_ID` secret usage in CI
- [x] Local `.clasp.json` excluded from git
- [x] `.clasp.json.example` committed as template

## Phase 5: Daily Report Message (Done)

- [x] Add schema coordinates for `Backlogs!K2`
- [x] Add config for cutoff hour and spreadsheet URL
- [x] Add `daily-report-message.builder.gs`
- [x] Resolve `dayA/dayB` from execution time
- [x] Read `F(dayA)` and `E(dayB)` from `Daily Report`
- [x] Compose final message in the fixed template
- [x] Write the final message to `Backlogs!K2`
- [x] Add manual tests for date resolution and message formatting

## Phase 6: Future Enhancements

- [ ] LockService / CacheService integration for desktop flow
- [ ] Dedicated validation layer for API payloads
- [ ] DTO / serializer layer for Flutter API
- [ ] Auto-calculate total hours from check-in / check-out
- [ ] Auto weekly summary sheet
- [ ] Sort projects inside daily report output by richer business rules
- [ ] Cache grouped report data
- [ ] Version tagging in CI/CD
- [ ] Staging vs production Apps Script project split
