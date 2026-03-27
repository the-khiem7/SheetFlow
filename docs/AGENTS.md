# AGENTS.md — Quy ước cho Coding Agents

## Nguyên tắc bắt buộc

1. **Backlogs sheet là source of truth** — mọi dữ liệu đều xuất phát từ đây
2. **Daily Report được generate từ Backlogs** — không bao giờ edit trực tiếp cột E/F của Daily Report
3. **Sorting phải chạy trước khi generate report**
4. **Formatting phải apply sau khi sort**
5. **Daily Report group tasks theo Date → Project**
6. **Finished tasks được filter bởi cột Status (D)**
7. **Script phải tránh concurrency issues** — sử dụng LockService
8. **Toàn bộ sheet structure được định nghĩa trong CONFIG** — không hardcode column index
9. **Services không được truy cập sheet layout trực tiếp** — phải qua CONFIG
10. **Luôn dùng Utils cho date comparison và string trimming**

## Cấu trúc code

Script được tổ chức theo service-layer architecture:

```
CONFIG → EVENT HANDLER → BacklogService → FormatService → DailyReportService → Utils
```

Khi thêm feature mới, đặt logic vào đúng service tương ứng. Không đặt business logic trong `onEdit`.

## Quy ước đặt tên

- Service objects: `PascalCase` (BacklogService, FormatService)
- Private functions: `camelCase_` với trailing underscore
- Config keys: `UPPER_SNAKE_CASE`
- File names: `kebab-case.gs`

## Data Model

### Backlogs Sheet (A:F, bắt đầu từ row 3)

| Cột | Field     | Mô tả           |
|-----|-----------|------------------|
| A   | Project   | Tên dự án        |
| B   | Task      | Mô tả công việc  |
| C   | Priority  | Mức độ ưu tiên   |
| D   | Status    | Ready / Finished |
| E   | Work Date | Ngày thực hiện   |
| F   | Note      | Ghi chú          |

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

```javascript
SORT_RULES = [
  { column: 5, ascending: false },  // Work Date DESC
  { column: 4, ascending: false },  // Status DESC
  { column: 3, ascending: true },   // Priority ASC
  { column: 1, ascending: true }    // Project A-Z
]
```

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
