# SheetFlow — Project Overview

## Giới thiệu

SheetFlow là hệ thống quản lý backlog, task tracking và daily report chạy hoàn toàn trên Google Sheets + Google Apps Script. Mã nguồn được quản lý bằng GitHub + clasp.

Hệ thống hoạt động như một mini workflow engine và data pipeline trên Google Sheets.

## Tính năng hiện tại

- Auto-sort Backlogs khi user edit (onEdit trigger)
- Sort theo: Work Date → Status → Priority → Project A-Z
- Auto border phân tách theo ngày (SOLID_MEDIUM)
- Auto alignment (B căn trái, A/C/D/E/F căn giữa)
- Daily Report tự động generate từ Backlogs
- Tasks group theo Date → Project
- Finished tasks tách riêng cột F
- LockService chống concurrent execution
- Selective daily refresh (chỉ rebuild khi edit cột liên quan)
- Manual `refreshAll()` để recovery

## Kiến trúc tổng quan

```
Backlogs Sheet (Database Table)
        ↓
Apps Script Backend (Service Layer)
        ↓
Sort + Format + Group
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

Dự án bắt đầu từ một script onEdit đơn giản để auto-sort Backlogs. Qua nhiều iteration, nó phát triển thành một hệ thống có service-layer architecture với CONFIG layer, multiple services, và CI/CD pipeline.
