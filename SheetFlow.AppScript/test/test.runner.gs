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
