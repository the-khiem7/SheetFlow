# SheetFlow — CI/CD Setup

## Pipeline Overview

```
Local Dev → git commit → git push → GitHub Actions → SheetFlow.AppScript/clasp push → Apps Script updated
```

GitHub là source of truth. Không edit code trực tiếp trên Apps Script web editor.

## Prerequisites

1. Node.js 18+
2. clasp: `npm install -g @google/clasp`
3. Google account với Apps Script project

## Setup lần đầu

### 1. Login clasp

```bash
clasp login
```

### 2. Tạo .clasp.json local

Copy template và điền scriptId:
```bash
cd SheetFlow.AppScript
cp .clasp.json.example .clasp.json
```
Sửa `<YOUR_SCRIPT_ID>` thành Script ID thật (lấy từ Apps Script editor → Project Settings).

File `.clasp.json` đã được gitignore — không bao giờ commit lên repo.

### 3. Tạo GitHub Secrets

Vào repo → Settings → Secrets and variables → Actions, tạo 2 secrets:

| Secret | Value |
|--------|-------|
| `SCRIPT_ID` | Script ID từ Apps Script Project Settings |
| `CLASP_CREDENTIALS` | Nội dung file `~/.clasprc.json` |

Để lấy credentials:
```bash
clasp login --no-localhost
cat ~/.clasprc.json
```
Copy toàn bộ JSON → paste vào secret `CLASP_CREDENTIALS`.

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy Apps Script

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: SheetFlow.AppScript
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          npm install -g @google/clasp
          sudo apt-get update && sudo apt-get install -y jq

      - name: Setup clasp credentials
        run: |
          echo '${{ secrets.CLASP_CREDENTIALS }}' > ~/.clasprc.json

      - name: Generate .clasp.json from template
        run: |
          # Use jq to safely replace scriptId in JSON
          jq --arg scriptId "${{ secrets.SCRIPT_ID }}" '.scriptId = $scriptId' .clasp.json.example > .clasp.json

      - name: Push to Apps Script
        run: clasp push
```

## Daily Workflow

```bash
# Edit code local
git add .
git commit -m "feat: add new feature"
git push

# GitHub Actions tự động chạy clasp push
```

## Manual clasp commands

| Command        | Mô tả                        |
|----------------|-------------------------------|
| `clasp login`  | Login Google account          |
| `clasp clone`  | Clone Apps Script project     |
| `clasp pull`   | Pull code từ Apps Script      |
| `clasp push`   | Push code lên Apps Script     |
| `clasp open`   | Mở Apps Script editor         |
| `clasp status` | Xem file thay đổi             |

## Lưu ý bảo mật

- `SheetFlow.AppScript/.clasp.json` chứa scriptId → đã gitignore, generate trong CI từ secret `SCRIPT_ID`
- `.clasprc.json` chứa access/refresh token → đã gitignore, inject trong CI từ secret `CLASP_CREDENTIALS`
- Không bao giờ commit credentials vào repo
- Dùng `SheetFlow.AppScript/.clasp.json.example` làm template cho developer mới

### Cách lấy CLASP_CREDENTIALS

File `~/.clasprc.json` được tạo khi bạn chạy `clasp login`. Nội dung có dạng:

```json
{
  "token": {
    "access_token": "...",
    "refresh_token": "...",
    "client_id": "...",
    "client_secret": "..."
  }
}
```

Nếu chưa có hoặc token hết hạn:
```bash
clasp login --no-localhost
```

Sau đó copy toàn bộ nội dung file:
- Linux/Mac: `cat ~/.clasprc.json`
- Windows: `type %USERPROFILE%\.clasprc.json`

Paste vào GitHub → Settings → Secrets → `CLASP_CREDENTIALS`.

**Cảnh báo:** Ai có file này có thể deploy Apps Script của bạn. Không bao giờ commit, share, hay paste vào nơi công khai.

## .clasp.json

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": ".",
  "filePushOrder": [
    "src/config/...",
    "src/shared/...",
    "src/domain/...",
    "src/repositories/...",
    "src/services/...",
    "src/api/...",
    "src/app/main.gs"
  ]
}
```
Chạy các lệnh `clasp` từ thư mục `SheetFlow.AppScript/`.
