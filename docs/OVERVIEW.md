# SheetFlow — Project Overview

## Giới thiệu

SheetFlow là hệ thống quản lý backlog, task tracking và daily report chạy hoàn toàn trên Google Sheets + Google Apps Script. Mã nguồn được quản lý bằng GitHub + clasp.

Hệ thống hoạt động như một mini workflow engine và data pipeline trên Google Sheets.

## Tính năng hiện tại

- Auto-sort Backlogs khi user edit (onEdit trigger)
- Sort theo: pinned → Work Date → Status → Priority → Project A-Z
- Auto border phân tách theo pinned / no-date / date-group (SOLID_MEDIUM)
- Auto alignment (B căn trái, A/C/D/E/F/G căn giữa)
- Daily Report tự động generate từ Backlogs
- Tasks group theo Date → Project
- Finished tasks tách riêng cột F
- Flutter mobile app gọi API qua Apps Script Web App
- Desktop users thao tác trực tiếp trên Google Sheets bằng `onEdit`
- Manual `refreshAll()` để recovery

## Kiến trúc tổng quan

```
Backlogs Sheet (Database Table)
        ↓              Flutter Mobile
Desktop Flow      ↔     HTTP API
        ↓
Apps Script Backend (layered structure)
        ↓
Repositories + Domain + Services
        ↓
Daily Report Sheet (Materialized View)
```

## Tech Stack

- Google Sheets — Database + UI
- Google Apps Script (V8) — Backend
- clasp — Local development + deployment
- GitHub — Source control
- GitHub Actions — CI/CD

## Deployment

```
git push → GitHub Actions → SheetFlow.AppScript/clasp push → Apps Script updated
```

## Nguồn gốc

Dự án bắt đầu từ một script `onEdit` đơn giản để auto-sort Backlogs. Qua nhiều iteration, nó phát triển thành một Apps Script backend có:

- desktop flow cho Google Sheets trực tiếp
- mobile API cho Flutter client
- layered structure với config/domain/repository/service/api/app
- CI/CD bằng `clasp` + GitHub Actions
