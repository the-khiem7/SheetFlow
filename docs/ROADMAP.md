# SheetFlow — Roadmap

## Phase 0: Foundation (Done)
- [x] Basic onEdit auto-sort (C/D/E columns)
- [x] sortBacklogs() manual trigger
- [x] applyDateBorders (top border khi đổi ngày)
- [x] applyAlignment (B left, ACDEF center)
- [x] Fix trigger cho tất cả cột A-F
- [x] Daily Report generation (group by Date → Project)
- [x] Finished tasks filter cho cột F
- [x] Utils: toDateKey, isSameDate, safeTrim
- [x] Sort A-Z theo Project (tie-breaker)
- [x] Bỏ dãn dòng giữa project trong report

## Phase 1: Service Layer Refactor (Done)
- [x] CONFIG layer trung tâm
- [x] BacklogService object
- [x] DailyReportService object
- [x] FormatService object
- [x] Utils object với getDataRange
- [x] refreshAll() manual command

## Phase 2: Concurrency & Performance (Not Started)
- [ ] LockService.tryLock() trong onEdit
- [ ] Selective daily refresh (chỉ khi edit cột A/B/D/E)
- [ ] LockService wrapper (centralized lock management)
- [ ] Debounce refreshDailyReport bằng CacheService
- [ ] Edit Queue (onEdit chỉ mark dirty, worker xử lý sau)
- [ ] Batch formatting (giảm setBorder/setAlignment calls)
- [ ] Partial refresh (chỉ refresh ngày bị ảnh hưởng)
- [ ] Cache backlog grouping

## Phase 3: Multi-file Structure (Done)
- [x] Tách code.gs thành nhiều file theo service
- [x] config.gs
- [x] utils.gs
- [x] format.service.gs
- [x] backlog.service.gs
- [x] dailyreport.service.gs
- [x] main.gs (event handlers + manual commands)

## Phase 3.5: Layered Folder Refactor (Done)
- [x] Tách `src/` thành `app`, `api`, `config`, `domain`, `repositories`, `services`, `shared`
- [x] Tạo `sheet.schema.gs` làm nguồn chân lý cho schema bảng
- [x] Đưa toàn bộ `SpreadsheetApp` access vào repository layer
- [x] Đưa toàn bộ `PropertiesService` access vào repository layer
- [x] Tách desktop flow khỏi Flutter API flow
- [x] Chuẩn hóa field cột F thành `note`
- [x] Giữ global entrypoints chỉ còn trong `src/app/main.gs`

## Phase 4: CI/CD (Done)
- [x] GitHub Actions workflow (clasp push on main push)
- [x] CLASP_CREDENTIALS secret setup
- [x] SCRIPT_ID secret (không commit scriptId vào repo)
- [x] .clasp.json gitignored, generate trong CI
- [x] .clasp.json.example template

## Phase 5: Future Enhancements
- [ ] LockService / CacheService integration cho desktop flow
- [ ] Validation layer riêng cho API payload
- [ ] Dedicated DTO / serializer layer cho Flutter API
- [ ] Auto tính Total Hours từ Check-in/Check-out
- [ ] Auto weekly summary sheet
- [ ] Sort project trong E/F theo priority hoặc số task
- [ ] CacheService cho grouped data
- [ ] Version tagging trong CI/CD
- [ ] Staging vs production script project
