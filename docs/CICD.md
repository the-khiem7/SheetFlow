# SheetFlow CI/CD

## Mục tiêu

- Code Apps Script được quản lý trong GitHub
- Push vào `main` sẽ chạy GitHub Actions và deploy lên Apps Script
- Không chỉnh code trực tiếp trên Apps Script editor trừ khi debug khẩn cấp

## Secrets cần tạo

Vào `GitHub repo -> Settings -> Secrets and variables -> Actions`, tạo 3 secrets:

| Secret | Bắt buộc | Dùng cho | Giá trị |
|---|---|---|---|
| `CLASP_CREDENTIALS` | Có | `clasp push`, `clasp deploy` | Toàn bộ nội dung file `~/.clasprc.json` sau khi chạy `clasp login --no-localhost` |
| `SCRIPT_ID` | Có | Generate `.clasp.json` trong CI | Script ID của Apps Script project |
| `DEPLOYMENT_ID` | Có | Cập nhật web app deployment hiện có | Deployment ID của web app |

## Cách lấy từng secret

### 1. `CLASP_CREDENTIALS`

Prerequisite:

- Đã cài Node.js
- Đã cài `clasp`: `npm install -g @google/clasp`
- Đăng nhập bằng đúng Google account có quyền sửa Apps Script project

Thực hiện:

```bash
clasp login --no-localhost
```

Sau khi login xong, lấy nội dung file credentials:

```bash
# macOS / Linux
cat ~/.clasprc.json

# Windows PowerShell
Get-Content $HOME\.clasprc.json
```

Copy toàn bộ JSON và lưu vào secret `CLASP_CREDENTIALS`.

Lưu ý:

- Không dùng service account JSON cho secret này
- `clasp` hiện support ổn định nhất với credentials sinh ra từ `clasp login`
- Ai có secret này có thể deploy Apps Script của bạn

### 2. `SCRIPT_ID`

Cách lấy:

1. Mở Apps Script project
2. Vào `Project Settings`
3. Copy `Script ID`

Hoặc nếu máy local đã cấu hình:

```bash
Get-Content SheetFlow.AppScript\.clasp.json
```

Lấy giá trị của `scriptId` và lưu vào secret `SCRIPT_ID`.

### 3. `DEPLOYMENT_ID`

Cách lấy:

1. Mở Apps Script project
2. Chọn `Deploy -> Manage deployments`
3. Chọn web app deployment đang dùng
4. Copy `Deployment ID` dạng `AKfyc...`

Lưu vào secret `DEPLOYMENT_ID`.

## Thiết lập local lần đầu

```bash
cd SheetFlow.AppScript
Copy-Item .clasp.json.example .clasp.json
```

Sửa `scriptId` trong `.clasp.json` bằng Apps Script project thật của bạn.

File `.clasp.json` là file local, không commit.

## Quy trình deploy

```text
Local change -> git push main -> GitHub Actions -> clasp push -> clasp deploy
```

Workflow hiện nằm ở:

- [.github/workflows/deploy.yml](/d:/SourceCode/PROJECTS/SheetFlow/.github/workflows/deploy.yml)

## Kiểm tra trước khi push

Chạy trong `SheetFlow.AppScript/`:

```bash
clasp status
clasp push
```

Nếu local push fail thì CI cũng sẽ fail.

## Các lệnh hay dùng

| Command | Mục đích |
|---|---|
| `clasp login --no-localhost` | Lấy / refresh credentials |
| `clasp status` | Xem file nào sẽ được push |
| `clasp push` | Push code lên Apps Script |
| `clasp deploy --deploymentId "<id>"` | Cập nhật deployment hiện có |
| `clasp open` | Mở Apps Script editor |

## Troubleshooting ngắn

### `Request contains an invalid argument`

Kiểm tra theo thứ tự:

1. `CLASP_CREDENTIALS` có đúng là nội dung `~/.clasprc.json` không
2. Google account dùng để login có quyền `Editor` trên Apps Script project không
3. `SCRIPT_ID` có đúng project đang deploy không
4. Local `clasp push` có chạy được không

### CI báo secret thiếu

Kiểm tra đủ 3 secrets:

- `CLASP_CREDENTIALS`
- `SCRIPT_ID`
- `DEPLOYMENT_ID`

### Muốn rotate credentials

Chạy lại:

```bash
clasp login --no-localhost
```

Sau đó cập nhật lại secret `CLASP_CREDENTIALS`.
