# Advanced Test Automation cho Apps Script

## Vấn đề với testing hiện tại:

Google Apps Script test **không thể chạy tự động** trong GitHub Actions vì:
- Không có Node.js runtime cho Apps Script code
- Cần Apps Script execution environment
- Không có direct API để trigger function execution

## Giải pháp Automated Testing:

### 1. Hybrid Testing Approach

Tạo 2 loại test:

#### A. Unit Tests (chạy được với Node.js)
```javascript
// test/sort.service.unit.test.js
const { SortService } = require('../sort.service.gs'); // Mock version

describe('SortService', () => {
  test('sortRows sorts pinned tasks first', () => {
    // Test logic với mock data
  });
});
```

#### B. Integration Tests (chạy trong Apps Script)
```javascript
// test/sort.service.integration.gs - chỉ chạy trong Apps Script
function testSortServiceIntegration() {
  // Test với real Apps Script services
}
```

### 2. GitHub Actions với Test Automation

```yaml
name: Test & Deploy Apps Script

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm test  # Chạy unit tests

  integration-test:
    needs: unit-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup clasp
        run: npm install -g @google/clasp
      - name: Deploy to test project
        run: |
          # Deploy to separate test Apps Script project
          echo '{"scriptId": "${{ secrets.TEST_SCRIPT_ID }}"}' > .clasp.json
          clasp push
      - name: Run integration tests
        run: |
          # Sử dụng Apps Script API để trigger test execution
          # Hoặc headless browser để simulate user actions

  deploy:
    needs: integration-test
    if: github.ref == 'refs/heads/main'
    # ... existing deploy job
```

### 3. Apps Script API Testing

```javascript
// scripts/run-tests.js
const { google } = require('googleapis');

async function runAppsScriptTest() {
  const script = google.script('v1');

  const result = await script.scripts.run({
    scriptId: process.env.TEST_SCRIPT_ID,
    requestBody: {
      function: 'runAllTests'
    }
  });

  return result.data;
}
```

## Implementation Steps:

1. **Tạo test Apps Script project riêng** cho CI
2. **Implement Apps Script API integration**
3. **Setup headless browser testing** cho E2E tests
4. **Add test reporting** và coverage

## Quick Win - Current Pipeline

Pipeline hiện tại đã tốt cho:
- ✅ Code quality checks
- ✅ Syntax validation
- ✅ File structure validation
- ⚠️ Manual test execution required

## Recommended Next Steps:

1. **Immediate**: Use current CI for code quality gates
2. **Short-term**: Implement Node.js unit tests với mocks
3. **Long-term**: Full Apps Script API integration cho automated testing