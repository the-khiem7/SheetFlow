// SortService Tests
// Run these manually in Apps Script editor to validate sorting logic

function testSortService() {
  console.log("Testing SortService...");

  // Test data: [Project, Task, Priority, Status, Date, Note, Pinned]
  const testRows = [
    ["Project A", "Task 1", "Cao", "Todo", new Date("2024-01-03"), "Note 1", false],
    ["Project B", "Task 2", "Trung bình", "In Progress", new Date("2024-01-01"), "Note 2", true],
    ["Project C", "Task 3", "Thấp", "Done", new Date("2024-01-02"), "Note 3", false],
    ["Project D", "Task 4", "Cao", "Todo", "", "Note 4", true], // No date, pinned
    ["Project E", "Task 5", "Trung bình", "Todo", "", "Note 5", false], // No date, unpinned
    ["Project F", "Task 6", "Thấp", "Todo", new Date("2024-01-03"), "Note 6", false]
  ];

  const sorted = SortService.sortRows(testRows);

  console.log("Original order:");
  testRows.forEach((row, i) => console.log(`${i}: ${row[0]} - ${row[1]} - ${row[6] ? 'PINNED' : 'unpinned'} - ${row[4] || 'no date'}`));

  console.log("\nSorted order:");
  sorted.forEach((row, i) => console.log(`${i}: ${row[0]} - ${row[1]} - ${row[6] ? 'PINNED' : 'unpinned'} - ${row[4] || 'no date'}`));

  // Expected order: Pinned first (by date desc), then unpinned (by date desc)
  // Within same date/no date groups: status asc, priority asc, project asc, task asc
  // 1. Pinned no date (Task 4 - 1.Cao)
  // 2. Pinned with date 2024-01-01 (Task 2 - 2.Trung bình)
  // 3. Unpinned no date (Task 5 - 2.Trung bình)
  // 4. Unpinned 2024-01-02 (Task 3 - 3.Thấp)
  // 5. Unpinned 2024-01-03 (Task 1 - 1.Cao)
  // 6. Unpinned 2024-01-03 (Task 6 - 3.Thấp)

  const expectedProjects = ["Project D", "Project B", "Project E", "Project C", "Project A", "Project F"];
  const actualProjects = sorted.map(row => row[0]);

  if (JSON.stringify(expectedProjects) === JSON.stringify(actualProjects)) {
    console.log("✅ Sort test PASSED");
  } else {
    console.log("❌ Sort test FAILED");
    console.log("Expected:", expectedProjects);
    console.log("Actual:", actualProjects);
  }
}

function testIsOrderChanged() {
  console.log("\nTesting isOrderChanged...");

  const original = [
    ["A", "Task1", "High", "Todo", "2024-01-01", "Note", true],
    ["B", "Task2", "Medium", "Done", "2024-01-02", "Note", false]
  ];

  const same = [
    ["A", "Task1", "High", "Todo", "2024-01-01", "Note", true],
    ["B", "Task2", "Medium", "Done", "2024-01-02", "Note", false]
  ];

  const different = [
    ["B", "Task2", "Medium", "Done", "2024-01-02", "Note", false],
    ["A", "Task1", "High", "Todo", "2024-01-01", "Note", true]
  ];

  console.log("Same order:", SortService.isOrderChanged(original, same)); // Should be false
  console.log("Different order:", SortService.isOrderChanged(original, different)); // Should be true
}