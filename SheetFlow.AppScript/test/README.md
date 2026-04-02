# Test Files

This directory contains test files for the SheetFlow project. These tests are designed to run in the Google Apps Script environment.

## Test Files

- `test.runner.gs` - Main test runner that executes all test suites
- `sort.service.test.gs` - Tests for the sorting service functionality
- `border.test.gs` - Tests for the improved border logic

## How to Run Tests

1. The default `clasp` config does not deploy files in `test/`
2. If you want to run these tests in Apps Script, temporarily include them in `.clasp.json` or copy them into a test script project
3. Open the Google Apps Script editor
4. Run the `runAllTests()` function
5. Check the execution logs for results

## Note

These test files live in the same Apps Script project tree for validation and manual execution. They are not part of the production runtime path unless you invoke the test runner explicitly.
