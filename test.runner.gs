// Test Runner for SheetFlow Task Pinning Implementation
// Execute this function in Apps Script to validate the implementation

function runAllTests() {
  console.log("=== SheetFlow Task Pinning Tests ===\n");

  try {
    // Test 1: SortService basic functionality
    console.log("1. Testing SortService.sortRows()...");
    testSortServiceBasic();
    console.log("   ✅ SortService basic test passed\n");

    // Test 2: SortService edge cases
    console.log("2. Testing SortService edge cases...");
    testSortServiceEdgeCases();
    console.log("   ✅ SortService edge cases test passed\n");

    // Test 3: isOrderChanged functionality
    console.log("3. Testing SortService.isOrderChanged()...");
    testIsOrderChanged();
    console.log("   ✅ isOrderChanged test passed\n");

    // Test 4: Config validation
    console.log("4. Testing CONFIG updates...");
    testConfigUpdates();
    console.log("   ✅ Config test passed\n");

    // Test 5: BacklogService integration
    console.log("5. Testing BacklogService integration...");
    testBacklogServiceIntegration();
    console.log("   ✅ BacklogService integration test passed\n");

    console.log("🎉 All tests passed! Implementation is ready for deployment.");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

function testSortServiceBasic() {
  // Test data: [Project, Task, Priority, Status, Date, Note, Pinned]
  const rows = [
    ["Project C", "Task C", "Low", "Done", new Date("2024-01-01"), "Note C", false],
    ["Project A", "Task A", "High", "Todo", new Date("2024-01-02"), "Note A", true], // Should be first (pinned)
    ["Project B", "Task B", "Medium", "In Progress", new Date("2024-01-01"), "Note B", false]
  ];

  const sorted = SortService.sortRows(rows);

  // Expected: Task A (pinned), Task B (2024-01-01), Task C (2024-01-01 but lower priority)
  const expected = ["Task A", "Task B", "Task C"];
  const actual = sorted.map(row => row[1]);

  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`Sort order incorrect. Expected: ${expected}, Got: ${actual}`);
  }
}

function testSortServiceEdgeCases() {
  // Test with no dates, mixed pinned/unpinned
  const rows = [
    ["P1", "T1", "High", "Todo", "", "N1", false], // Unpinned, no date
    ["P2", "T2", "Low", "Todo", "", "N2", true],  // Pinned, no date - should come first
    ["P3", "T3", "Medium", "Todo", new Date("2024-01-01"), "N3", true], // Pinned with date
    ["P4", "T4", "High", "Todo", new Date("2024-01-01"), "N4", false] // Unpinned with date
  ];

  const sorted = SortService.sortRows(rows);
  const expected = ["T2", "T3", "T1", "T4"]; // Pinned no date, Pinned with date, Unpinned no date, Unpinned with date
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

  const same = JSON.parse(JSON.stringify(original)); // Deep copy
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
}

function testBacklogServiceIntegration() {
  // Test that BacklogService has the expected methods
  const methods = ['handleEdit', 'sortAndFormat', 'sortManual', 'setupPinnedColumn'];
  methods.forEach(method => {
    if (typeof BacklogService[method] !== 'function') {
      throw new Error(`BacklogService.${method} should be a function`);
    }
  });
}