// Test Runner for SheetFlow Task Pinning Implementation
// Execute this function in Apps Script to validate the implementation

function runAllTests() {
  console.log("=== SheetFlow Task Pinning Tests ===\n");

  try {
    // Test 1: SortService basic functionality
    console.log("1. Testing SortService.sortRows()...");
    testSortServiceBasic();
    console.log("   PASS: SortService basic test passed\n");

    // Test 2: SortService edge cases
    console.log("2. Testing SortService edge cases...");
    testSortServiceEdgeCases();
    console.log("   PASS: SortService edge cases test passed\n");

    // Test 3: isOrderChanged functionality
    console.log("3. Testing SortService.isOrderChanged()...");
    testIsOrderChanged();
    console.log("   PASS: isOrderChanged test passed\n");

    // Test 4: Config validation
    console.log("4. Testing CONFIG updates...");
    testConfigUpdates();
    console.log("   PASS: Config test passed\n");

    // Test 5: BacklogService integration
    console.log("5. Testing BacklogService integration...");
    testBacklogServiceIntegration();
    console.log("   PASS: BacklogService integration test passed\n");

    // Test 6: Improved border logic
    console.log("6. Testing improved border logic...");
    testImprovedBorders();
    console.log("   PASS: Improved border logic test passed\n");

    // Test 7: Daily report message date resolution
    console.log("7. Testing daily report message date resolution...");
    testDailyReportMessageDateResolution();
    console.log("   PASS: Daily report message date resolution test passed\n");

    // Test 8: Daily report message formatting
    console.log("8. Testing daily report message formatting...");
    testDailyReportMessageFormatting();
    console.log("   PASS: Daily report message formatting test passed\n");

    // Test 9: Weekend completed report merge
    console.log("9. Testing weekend completed report merge...");
    testWeekendCompletedReportMerge();
    console.log("   PASS: Weekend completed report merge test passed\n");

    // Test 10: Execution coordinator lifecycle
    console.log("10. Testing execution coordinator lifecycle...");
    testExecutionCoordinatorLifecycle();
    console.log("   PASS: Execution coordinator lifecycle test passed\n");

    // Test 11: Execution coordinator lock failure
    console.log("11. Testing execution coordinator lock failure...");
    testExecutionCoordinatorLockFailure();
    console.log("   PASS: Execution coordinator lock failure test passed\n");

    // Test 12: Execution coordinator stale detection
    console.log("12. Testing execution coordinator stale detection...");
    testExecutionCoordinatorStaleDetection();
    console.log("   PASS: Execution coordinator stale detection test passed\n");

    // Test 13: Refresh service guarded processing
    console.log("13. Testing refresh service guarded processing...");
    testRefreshServiceGuardedProcessing();
    console.log("   PASS: Refresh service guarded processing test passed\n");

    // Test 14: API refresh handlers
    console.log("14. Testing API refresh handlers...");
    testApiRefreshHandlers();
    console.log("   PASS: API refresh handlers test passed\n");

    console.log("All tests passed. Implementation is ready for deployment.");

  } catch (error) {
    console.error("Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

function testSortServiceBasic() {
  // Test data: [Project, Task, Priority, Status, Date, Note, Pinned]
  const rows = [
    ["Project C", "Task C", "Low", "Done", new Date("2024-01-01"), "Note C", false],
    ["Project A", "Task A", "High", "Todo", new Date("2024-01-02"), "Note A", true],
    ["Project B", "Task B", "Medium", "In Progress", new Date("2024-01-01"), "Note B", false]
  ];

  const sorted = SortService.sortRows(rows);
  const expected = ["Task A", "Task B", "Task C"];
  const actual = sorted.map(row => row[1]);

  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`Sort order incorrect. Expected: ${expected}, Got: ${actual}`);
  }
}

function testSortServiceEdgeCases() {
  const rows = [
    ["P1", "T1", "High", "Todo", "", "N1", false],
    ["P2", "T2", "Low", "Todo", "", "N2", true],
    ["P3", "T3", "Medium", "Todo", new Date("2024-01-01"), "N3", true],
    ["P4", "T4", "High", "Todo", new Date("2024-01-01"), "N4", false]
  ];

  const sorted = SortService.sortRows(rows);
  const expected = ["T2", "T3", "T1", "T4"];
  const actual = sorted.map(row => row[1]);

  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`Edge case sort failed. Expected: ${expected}, Got: ${actual}`);
  }
}

function testIsOrderChanged() {
  const original = [
    ["P1", "T1", "High", "Todo", "2024-01-01", "N1", true],
    ["P2", "T2", "Medium", "Done", "2024-01-02", "N2", false]
  ];

  const same = JSON.parse(JSON.stringify(original));
  const different = [
    ["P2", "T2", "Medium", "Done", "2024-01-02", "N2", false],
    ["P1", "T1", "High", "Todo", "2024-01-01", "N1", true]
  ];

  if (SortService.isOrderChanged(original, same)) {
    throw new Error("isOrderChanged should return false for identical arrays");
  }

  if (!SortService.isOrderChanged(original, different)) {
    throw new Error("isOrderChanged should return true for different order");
  }
}

function testConfigUpdates() {
  if (CONFIG.BACKLOGS.NUM_COLS !== 7) {
    throw new Error(`CONFIG.BACKLOGS.NUM_COLS should be 7, got ${CONFIG.BACKLOGS.NUM_COLS}`);
  }

  if (CONFIG.BACKLOGS.DAILY_MESSAGE_ROW !== 2 || CONFIG.BACKLOGS.DAILY_MESSAGE_COL !== 11) {
    throw new Error("Daily message cell config should point to K2");
  }
}

function testBacklogServiceIntegration() {
  const methods = ["handleEdit", "sortAndFormat", "sortManual", "setupPinnedColumn"];
  methods.forEach(method => {
    if (typeof BacklogService[method] !== "function") {
      throw new Error(`BacklogService.${method} should be a function`);
    }
  });

  if (typeof DailyReportService.refreshMessage !== "function") {
    throw new Error("DailyReportService.refreshMessage should be a function");
  }
}

function testImprovedBorders() {
  const testTasks = [
    ["P1", "Pinned Task 1", "High", "Todo", new Date("2024-01-01"), "Note1", true],
    ["P2", "Pinned Task 2", "Low", "Done", "", "Note2", true],
    ["P3", "No Date Task", "Medium", "In Progress", "", "Note3", false],
    ["P4", "Dated Task 1", "High", "Todo", new Date("2024-01-02"), "Note4", false],
    ["P5", "Dated Task 2", "Low", "Done", new Date("2024-01-02"), "Note5", false],
    ["P6", "Dated Task 3", "Medium", "Todo", new Date("2024-01-01"), "Note6", false]
  ];

  const expectedGroups = [
    "PINNED",
    "PINNED",
    "NO_DATE",
    "DATED_2024-01-02",
    "DATED_2024-01-02",
    "DATED_2024-01-01"
  ];

  const actualGroups = testTasks.map(task => FormatService._getTaskGroup(task));

  if (JSON.stringify(expectedGroups) !== JSON.stringify(actualGroups)) {
    throw new Error(`Group classification failed. Expected: ${JSON.stringify(expectedGroups)}, Got: ${JSON.stringify(actualGroups)}`);
  }

  const expectedBorders = [false, true, true, false, true];

  for (let i = 1; i < testTasks.length; i++) {
    const prevGroup = FormatService._getTaskGroup(testTasks[i - 1]);
    const currentGroup = FormatService._getTaskGroup(testTasks[i]);
    const shouldBorder = prevGroup !== currentGroup;
    const expected = expectedBorders[i - 1];

    if (shouldBorder !== expected) {
      throw new Error(`Border logic failed at transition ${i}: expected ${expected}, got ${shouldBorder} (${prevGroup} -> ${currentGroup})`);
    }
  }
}

function testDailyReportMessageDateResolution() {
  const beforeCutoff = new Date("2026-04-15T08:30:00");
  const beforeResolved = DailyReportMessageBuilder.resolveReportDates(beforeCutoff);

  if (beforeResolved.dayAKey !== "2026-04-14") {
    throw new Error(`Before cutoff dayA should be 2026-04-14, got ${beforeResolved.dayAKey}`);
  }

  if (beforeResolved.dayBKey !== "2026-04-15") {
    throw new Error(`Before cutoff dayB should be 2026-04-15, got ${beforeResolved.dayBKey}`);
  }

  const afterCutoff = new Date("2026-04-15T09:30:00");
  const afterResolved = DailyReportMessageBuilder.resolveReportDates(afterCutoff);

  if (afterResolved.dayAKey !== "2026-04-15") {
    throw new Error(`After cutoff dayA should be 2026-04-15, got ${afterResolved.dayAKey}`);
  }

  if (afterResolved.dayBKey !== "2026-04-16") {
    throw new Error(`After cutoff dayB should be 2026-04-16, got ${afterResolved.dayBKey}`);
  }

  const fridayBeforeWeekend = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-01T08:59:00"));
  assertDailyReportResolvedDates(fridayBeforeWeekend, false, "2026-04-30", "2026-05-01", "Friday 08:59");

  const fridayWeekendStart = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-01T09:00:00"));
  assertDailyReportResolvedDates(fridayWeekendStart, true, "2026-05-01", "2026-05-04", "Friday 09:00");

  const saturdayWeekend = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-02T14:30:00"));
  assertDailyReportResolvedDates(saturdayWeekend, true, "2026-05-01", "2026-05-04", "Saturday");

  const sundayWeekend = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-03T14:30:00"));
  assertDailyReportResolvedDates(sundayWeekend, true, "2026-05-01", "2026-05-04", "Sunday");

  const mondayBeforeCutoff = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-04T08:59:00"));
  assertDailyReportResolvedDates(mondayBeforeCutoff, true, "2026-05-01", "2026-05-04", "Monday 08:59");

  const mondayCutoff = DailyReportMessageBuilder.resolveReportDates(new Date("2026-05-04T09:00:00"));
  assertDailyReportResolvedDates(mondayCutoff, false, "2026-05-04", "2026-05-05", "Monday 09:00");

  if (fridayWeekendStart.dayADisplay !== "01,02,03/05/2026") {
    throw new Error(`Weekend dayADisplay should be 01,02,03/05/2026, got ${fridayWeekendStart.dayADisplay}`);
  }
}

function testDailyReportMessageFormatting() {
  const message = DailyReportMessageBuilder.buildMessage({
    dayADisplay: "15/04/2026",
    dayBDisplay: "16/04/2026",
    completedText: "1. Project A\n- Finish report",
    todayText: "1. Project B\n- Build endpoint",
    spreadsheetUrl: "https://example.com/sheet"
  });

  if (message.indexOf("15/04/2026") === -1) {
    throw new Error("Message header is incorrect");
  }

  if (message.indexOf("Nội dung đã thực hiện:\n1. Project A\n- Finish report") === -1) {
    throw new Error("Completed section is incorrect");
  }

  if (message.indexOf("Công việc hôm nay (16/04/2026):\n1. Project B\n- Build endpoint") === -1) {
    throw new Error("Today section is incorrect");
  }

  const emptyMessage = DailyReportMessageBuilder.buildMessage({
    dayADisplay: "15/04/2026",
    dayBDisplay: "16/04/2026",
    completedText: "",
    todayText: "",
    spreadsheetUrl: "https://example.com/sheet"
  });

  if (emptyMessage.indexOf("Nội dung đã thực hiện:\n-") === -1) {
    throw new Error("Empty completed section fallback is incorrect");
  }

  if (emptyMessage.indexOf("Công việc hôm nay (16/04/2026):\n-") === -1) {
    throw new Error("Empty today section fallback is incorrect");
  }
}

function testWeekendCompletedReportMerge() {
  const merged = DailyReportMessageBuilder.mergeCompletedProjectBlocks([
    "2. SheetFlow\n- Fix auto sort Backlogs",
    "1. Flutter Mobile\n- Connect API get tasks",
    "3. SheetFlow\n- Verify daily report message"
  ]);

  const expected = [
    "1. SheetFlow",
    "- Fix auto sort Backlogs",
    "- Verify daily report message",
    "2. Flutter Mobile",
    "- Connect API get tasks"
  ].join("\n");

  if (merged !== expected) {
    throw new Error(`Weekend completed merge failed. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(merged)}`);
  }

  if (merged.indexOf("2. SheetFlow") !== -1 || merged.indexOf("3. SheetFlow") !== -1) {
    throw new Error("Weekend completed merge should render project indexes from 1..n");
  }

  const emptyMerged = DailyReportMessageBuilder.mergeCompletedProjectBlocks(["", "   ", null]);
  const emptyMessage = DailyReportMessageBuilder.buildMessage({
    dayADisplay: "01,02,03/05/2026",
    dayBDisplay: "04/05/2026",
    completedText: emptyMerged,
    todayText: "",
    spreadsheetUrl: "https://example.com/sheet"
  });

  if (emptyMessage.indexOf("Ná»™i dung Ä‘Ã£ thá»±c hiá»‡n:\n-") === -1) {
    throw new Error("Weekend empty completed section fallback is incorrect");
  }
}

function assertDailyReportResolvedDates(resolved, expectedWeekendWindow, expectedDayAKey, expectedDayBKey, label) {
  if (!!resolved.isWeekendWindow !== expectedWeekendWindow) {
    throw new Error(`${label} weekendWindow should be ${expectedWeekendWindow}, got ${resolved.isWeekendWindow}`);
  }

  if (resolved.dayAKey !== expectedDayAKey) {
    throw new Error(`${label} dayA should be ${expectedDayAKey}, got ${resolved.dayAKey}`);
  }

  if (resolved.dayBKey !== expectedDayBKey) {
    throw new Error(`${label} dayB should be ${expectedDayBKey}, got ${resolved.dayBKey}`);
  }
}

function testExecutionCoordinatorLifecycle() {
  clearExecutionExecutionStateForTests();

  const dirtyResult = ExecutionCoordinatorService.markDirty("test:lifecycle");
  if (!dirtyResult.dirty || dirtyResult.revision < 1) {
    throw new Error("markDirty should set dirty state and revision");
  }

  const runContext = ExecutionCoordinatorService.beginRun("test:lifecycle", {
    requireDirty: true,
    lockTimeoutMs: 1
  });

  if (!runContext.started) {
    throw new Error("beginRun should start when dirty state exists");
  }

  if (ExecutionCoordinatorService.abortIfStale(runContext)) {
    throw new Error("Fresh run should not be stale");
  }

  ExecutionCoordinatorService.finishRun(runContext, "completed");
  const state = ExecutionStateRepository.getState();

  if (state.dirty) {
    throw new Error("finishRun(completed) should clear dirty state");
  }

  if (state.runningToken) {
    throw new Error("finishRun(completed) should clear running token");
  }

  if (state.lastRunReason !== "test:lifecycle") {
    throw new Error(`Unexpected lastRunReason: ${state.lastRunReason}`);
  }
}

function testExecutionCoordinatorLockFailure() {
  const originalTryAcquire = LockRepository.tryAcquire;

  try {
    LockRepository.tryAcquire = function() {
      return {
        lock: null,
        acquired: false
      };
    };

    const runContext = ExecutionCoordinatorService.beginRun("test:locked", {
      requireDirty: false,
      lockTimeoutMs: 1
    });

    if (runContext.started !== false || runContext.reason !== "locked") {
      throw new Error(`Expected locked result, got ${JSON.stringify(runContext)}`);
    }
  } finally {
    LockRepository.tryAcquire = originalTryAcquire;
  }
}

function testExecutionCoordinatorStaleDetection() {
  clearExecutionExecutionStateForTests();

  const firstDirty = ExecutionCoordinatorService.markDirty("test:stale:start");
  const runContext = ExecutionCoordinatorService.beginRun("test:stale", {
    requireDirty: true,
    lockTimeoutMs: 1
  });

  if (!runContext.started) {
    throw new Error("Run should start before stale simulation");
  }

  const secondDirty = ExecutionCoordinatorService.markDirty("test:stale:newer-edit");
  if (secondDirty.revision <= firstDirty.revision) {
    throw new Error("Sequential dirty marks should advance revision");
  }

  if (!ExecutionCoordinatorService.abortIfStale(runContext)) {
    throw new Error("Run should be detected as stale after newer revision");
  }

  const state = ExecutionStateRepository.getState();
  if (!state.dirty) {
    throw new Error("Stale abort should preserve dirty state");
  }
}

function testRefreshServiceGuardedProcessing() {
  clearExecutionExecutionStateForTests();

  const cleanResult = RefreshService.processDirty("test:clean", { force: false });
  if (cleanResult.accepted !== false || cleanResult.reason !== "clean") {
    throw new Error(`Clean processing should skip. Got: ${JSON.stringify(cleanResult)}`);
  }

  ExecutionCoordinatorService.markDirty("test:refresh");

  const originalSortManual = BacklogService.sortManual;
  const originalRefresh = DailyReportService.refresh;
  const calls = [];

  try {
    BacklogService.sortManual = function(runContext) {
      calls.push("sort:" + runContext.revision);
    };

    DailyReportService.refresh = function(runContext) {
      calls.push("report:" + runContext.revision);
    };

    const result = RefreshService.processDirty("test:refresh", { force: false });
    if (!result.accepted || result.reason !== "completed") {
      throw new Error(`Guarded processing should complete. Got: ${JSON.stringify(result)}`);
    }

    if (JSON.stringify(calls) !== JSON.stringify(["sort:" + result.revision, "report:" + result.revision])) {
      throw new Error(`Unexpected guarded processing order: ${JSON.stringify(calls)}`);
    }
  } finally {
    BacklogService.sortManual = originalSortManual;
    DailyReportService.refresh = originalRefresh;
  }
}

function testApiRefreshHandlers() {
  clearExecutionExecutionStateForTests();

  const originalRefreshAll = RefreshService.refreshAll;
  const originalProcessDirty = RefreshService.processDirty;

  try {
    RefreshService.refreshAll = function() {
      return { accepted: true, reason: "completed", revision: 99 };
    };

    RefreshService.processDirty = function() {
      return { accepted: false, reason: "clean" };
    };

    const forcedOutput = ApiRefresh.handleRefresh("POST", { force: "true" });
    const forcedBody = parseJsonOutputForTests(forcedOutput);
    if (!forcedBody.data || forcedBody.data.revision !== 99) {
      throw new Error("Forced refresh endpoint should return refreshAll result");
    }

    ExecutionCoordinatorService.markDirty("test:status");
    const statusOutput = ApiRefresh.handleStatus("GET");
    const statusBody = parseJsonOutputForTests(statusOutput);

    if (!statusBody.data || statusBody.data.dirty !== true) {
      throw new Error("Refresh status endpoint should expose dirty state");
    }
  } finally {
    RefreshService.refreshAll = originalRefreshAll;
    RefreshService.processDirty = originalProcessDirty;
  }
}

function clearExecutionExecutionStateForTests() {
  const props = APP_CONFIG.EXECUTION.PROPERTIES;

  ScriptPropertiesRepository.deleteProperty(props.DIRTY);
  ScriptPropertiesRepository.deleteProperty(props.REVISION);
  ScriptPropertiesRepository.deleteProperty(props.LAST_RUN_AT);
  ScriptPropertiesRepository.deleteProperty(props.LAST_RUN_REASON);
  ScriptPropertiesRepository.deleteProperty(props.LAST_RUN_RESULT);
  ScriptPropertiesRepository.deleteProperty(props.LAST_DIRTY_AT);
  ScriptPropertiesRepository.deleteProperty(props.LAST_DIRTY_REASON);
  ScriptPropertiesRepository.deleteProperty(props.RUNNING_TOKEN);
  ScriptPropertiesRepository.deleteProperty(props.RUNNING_REASON);
  ScriptPropertiesRepository.deleteProperty(props.RUNNING_REVISION);
}

function parseJsonOutputForTests(output) {
  return JSON.parse(output.getContent());
}
