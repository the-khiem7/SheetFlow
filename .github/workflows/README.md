# Deploy Workflow

Workflow deploy Apps Script nằm tại [deploy.yml](/d:/SourceCode/PROJECTS/SheetFlow/.github/workflows/deploy.yml).

## Secrets bắt buộc

Tạo trong `Settings -> Secrets and variables -> Actions`:

| Secret | Giá trị |
|---|---|
| `CLASP_CREDENTIALS` | Nội dung `~/.clasprc.json` sau khi chạy `clasp login --no-localhost` |
| `SCRIPT_ID` | Script ID của Apps Script project |
| `DEPLOYMENT_ID` | Deployment ID của web app đang dùng |

## Cách lấy nhanh

### `CLASP_CREDENTIALS`

```bash
clasp login --no-localhost

# Windows PowerShell
Get-Content $HOME\.clasprc.json

# macOS / Linux
cat ~/.clasprc.json
```

Copy toàn bộ JSON vào secret `CLASP_CREDENTIALS`.

### `SCRIPT_ID`

- Apps Script -> `Project Settings` -> `Script ID`

### `DEPLOYMENT_ID`

- Apps Script -> `Deploy` -> `Manage deployments` -> chọn web app -> copy `Deployment ID`

## Ghi chú

- Không dùng service account JSON cho `CLASP_CREDENTIALS`
- Nếu local `clasp push` fail thì CI sẽ fail tương tự
- Hướng dẫn đầy đủ hơn: [docs/CICD.md](/d:/SourceCode/PROJECTS/SheetFlow/docs/CICD.md)
