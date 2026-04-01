# Hướng dẫn chạy test local

Vì đây là Google Apps Script project, test **phải chạy trong Apps Script environment**, không thể chạy local với Node.js.

## Cách chạy test local:

### Bước 1: Setup project
```bash
# Clone repo
git clone <your-repo-url>
cd SheetFlow

# Install clasp
npm install -g @google/clasp

# Login clasp
clasp login

# Setup .clasp.json (copy từ template)
cp .clasp.json.example .clasp.json
# Edit .clasp.json với scriptId thật
```

### Bước 2: Push code lên Apps Script
```bash
# Push tất cả files (bao gồm test)
clasp push
```

### Bước 3: Mở Apps Script Editor
```bash
# Mở browser để chạy test
clasp open
```

### Bước 4: Chạy test trong Apps Script Editor

1. **Mở file `test/test.runner.gs`**
2. **Chạy function `runAllTests()`**
3. **Xem kết quả trong Execution Log** (View → Logs)

### Ví dụ kết quả test thành công:
```
=== SheetFlow Task Pinning Tests ===

1. Testing SortService.sortRows()...
   ✅ SortService basic test passed

2. Testing SortService edge cases...
   ✅ SortService edge cases test passed

3. Testing SortService.isOrderChanged()...
   ✅ isOrderChanged test passed

4. Testing CONFIG updates...
   ✅ Config test passed

5. Testing BacklogService integration...
   ✅ BacklogService integration test passed

6. Testing improved border logic...
   ✅ Improved border logic test passed

🎉 All tests passed! Implementation is ready for deployment.
```

### Lưu ý quan trọng:

- **Test chỉ chạy được trong Apps Script environment** - không có Node.js runtime
- **Cần push code trước khi test** - clasp push để sync files
- **Test runner phải được execute từ Apps Script Editor** - không thể chạy từ command line
- **Logs sẽ hiển thị trong Apps Script Executions tab**

### Troubleshooting:

```bash
# Nếu test fail, xem logs chi tiết
clasp logs

# Pull code từ Apps Script nếu có thay đổi
clasp pull

# Reset project nếu có vấn đề
clasp push --force
```

---

## 2. GitHub Actions Pipeline CI cho Testing

Tôi sẽ tạo pipeline CI riêng để chạy test tự động.