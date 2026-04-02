# AGENTS.md — Quy ước cho Coding Agents

## Nguyên tắc bắt buộc

1. **Backlogs sheet là source of truth** — mọi dữ liệu đều xuất phát từ đây
2. **Daily Report được generate từ Backlogs** — không bao giờ edit trực tiếp cột E/F của Daily Report
3. **Sorting phải chạy trước khi generate report**
4. **Formatting phải apply sau khi sort**
5. **Daily Report group tasks theo Date → Project**
6. **Finished tasks được filter bởi cột Status (D)**
7. **Script phải tránh concurrency issues** — sử dụng LockService
8. **Toàn bộ sheet structure được định nghĩa trong `sheet.schema.gs`** — không hardcode column index
9. **Services và API modules không được truy cập `SpreadsheetApp` / `PropertiesService` trực tiếp** — phải qua repository layer
10. **Luôn dùng shared/domain helpers cho date comparison, mapping, và string trimming**

## Cấu trúc code

Script được tổ chức theo layered structure:

```text
app → api / services → repositories / domain → config / shared
```

- `app/`: global Apps Script entrypoints
- `api/`: Flutter-facing HTTP handlers
- `services/`: desktop Google Sheets orchestration
- `repositories/`: lớp duy nhất truy cập Apps Script services
- `domain/`: sorting, formatting, mapping, report building
- `config/`: schema bảng và app constants
- `shared/`: helper dùng chung

Không đặt business logic trong `onEdit`, `doGet`, hoặc `doPost`.

## Quy ước đặt tên

- Service objects: `PascalCase` (BacklogService, FormatService)
- Private functions: `camelCase_` với trailing underscore
- Config keys: `UPPER_SNAKE_CASE`
- File names: `kebab-case.gs`

## Data Model

### Backlogs Sheet (A:G, bắt đầu từ row 3)

| Cột | Field     | Mô tả           |
|-----|-----------|------------------|
| A   | Project   | Tên dự án        |
| B   | Task      | Mô tả công việc  |
| C   | Priority  | Mức độ ưu tiên   |
| D   | Status    | Ready / Finished |
| E   | Work Date | Ngày thực hiện   |
| F   | Note      | Ghi chú          |
| G   | Pinned    | Đánh dấu ưu tiên |

### Daily Report Sheet (bắt đầu từ row 14)

| Cột | Field           |
|-----|-----------------|
| A   | Date            |
| B   | Check-in        |
| C   | Check-out       |
| D   | Total Hours     |
| E   | Daily Goals     |
| F   | Tasks Completed |

## Sort Rules

Task được sort theo:

1. `Pinned` trước
2. `Work Date` giảm dần trong từng nhóm pinned / unpinned
3. `Status`
4. `Priority`
5. `Project`
6. `Task`

## Lưu ý quan trọng

- `onEdit(e)` là simple trigger — không bấm Run trong editor
- Google Sheets phân biệt hoa thường trong tên sheet tab
- Apps Script load file theo alphabet order — đặt tên file có prefix nếu cần dependency order
- `.gs` và `.js` là tương đương trong Apps Script V8 runtime

## Bảo mật

- Không commit `.clasp.json` (chứa scriptId) và `.clasprc.json` (chứa token) lên repo
- Cả 2 file đã được gitignore
- Trong CI/CD, chúng được generate từ GitHub Secrets (`SCRIPT_ID`, `CLASP_CREDENTIALS`)
- Xem chi tiết tại [docs/CICD.md](CICD.md)
