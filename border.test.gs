// Test for improved border logic
function testImprovedBorders() {
  console.log("Testing improved border logic...");

  // Test data matching the sorting order
  const testTasks = [
    ["P1", "Pinned Task 1", "High", "Todo", new Date("2024-01-01"), "Note1", true],  // PINNED
    ["P2", "Pinned Task 2", "Low", "Done", "", "Note2", true],                    // PINNED
    ["P3", "No Date Task", "Medium", "In Progress", "", "Note3", false],          // NO_DATE
    ["P4", "Dated Task 1", "High", "Todo", new Date("2024-01-02"), "Note4", false], // DATED_2024-01-02
    ["P5", "Dated Task 2", "Low", "Done", new Date("2024-01-02"), "Note5", false],  // DATED_2024-01-02
    ["P6", "Dated Task 3", "Medium", "Todo", new Date("2024-01-01"), "Note6", false] // DATED_2024-01-01
  ];

  const expectedGroups = [
    'PINNED',      // Pinned Task 1
    'PINNED',      // Pinned Task 2
    'NO_DATE',     // No Date Task
    'DATED_2024-01-02', // Dated Task 1
    'DATED_2024-01-02', // Dated Task 2
    'DATED_2024-01-01'  // Dated Task 3
  ];

  const actualGroups = testTasks.map(task => FormatService._getTaskGroup(task));

  console.log("Expected groups:", expectedGroups);
  console.log("Actual groups:", actualGroups);

  if (JSON.stringify(expectedGroups) !== JSON.stringify(actualGroups)) {
    throw new Error("Group classification failed");
  }

  // Test border logic
  const expectedBorders = [false, true, true, false, true]; // Borders at indices 1, 2, 4 (after rows 2, 3, 5)

  for (let i = 1; i < testTasks.length; i++) {
    const prevGroup = FormatService._getTaskGroup(testTasks[i-1]);
    const currentGroup = FormatService._getTaskGroup(testTasks[i]);
    const shouldBorder = prevGroup !== currentGroup;
    const expected = expectedBorders[i-1];

    if (shouldBorder !== expected) {
      throw new Error(`Border logic failed at index ${i}: expected ${expected}, got ${shouldBorder}`);
    }
  }

  console.log("✅ Improved border logic test passed");
}