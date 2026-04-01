const SortService = {
  /**
   * Sorts rows based on pinning and date priority
   * @param {Array<Array>} rows - 2D array of row data
   * @returns {Array<Array>} - Sorted rows
   */
  sortRows(rows) {
    return rows.slice().sort((a, b) => {
      // Column indices: 0=Project, 1=Task, 2=Priority, 3=Status, 4=Date, 5=Note, 6=Pinned

      const pinnedA = Boolean(a[6]);
      const pinnedB = Boolean(b[6]);

      // Pinned tasks first
      if (pinnedA !== pinnedB) {
        return pinnedA ? -1 : 1;
      }

      // Within each group, sort by date descending (newest first)
      const dateA = Utils.toDateKey(a[4]);
      const dateB = Utils.toDateKey(b[4]);

      // Empty dates sort before filled dates within their pinned/unpinned group
      if (!dateA && !dateB) {
        // Both empty, sort by status asc, priority asc, project asc, task asc
        const statusCompare = this._compareStatus(a[3], b[3]);
        if (statusCompare !== 0) return statusCompare;
        const priorityCompare = this._comparePriority(a[2], b[2]);
        if (priorityCompare !== 0) return priorityCompare;
        const projectCompare = a[0].localeCompare(b[0]);
        if (projectCompare !== 0) return projectCompare;
        return a[1].localeCompare(b[1]);
      }

      if (!dateA) return -1; // Empty date comes first
      if (!dateB) return 1;

      const dateCompare = dateB.localeCompare(dateA); // Descending
      if (dateCompare !== 0) return dateCompare;

      // Same date: status asc, priority asc, project asc, task asc
      const statusCompare = this._compareStatus(a[3], b[3]);
      if (statusCompare !== 0) return statusCompare;
      const priorityCompare = this._comparePriority(a[2], b[2]);
      if (priorityCompare !== 0) return priorityCompare;
      const projectCompare = a[0].localeCompare(b[0]);
      if (projectCompare !== 0) return projectCompare;
      return a[1].localeCompare(b[1]);
    });
  },

  /**
   * Checks if the order of rows has changed after sorting
   * @param {Array<Array>} original - Original row order
   * @param {Array<Array>} sorted - Sorted row order
   * @returns {boolean} - True if order changed
   */
  isOrderChanged(original, sorted) {
    if (original.length !== sorted.length) return true;

    for (let i = 0; i < original.length; i++) {
      // Compare key fields to determine if rows are in same order
      const orig = original[i];
      const sort = sorted[i];

      if (orig.length !== sort.length) return true;

      // Compare all columns except Note (column 5) which might have formatting differences
      for (let j = 0; j < orig.length; j++) {
        if (j !== 5 && orig[j] !== sort[j]) return true;
      }
    }

    return false;
  },

  /**
   * Compares priority values (Cao > Trung bình > Thấp, ascending)
   * @param {string} a - Priority A
   * @param {string} b - Priority B
   * @returns {number} - Comparison result
   */
  _comparePriority(a, b) {
    const priorityOrder = { 'Cao': 3, 'Trung bình': 2, 'Thấp': 1 };

    const valA = priorityOrder[String(a).trim()] || 0;
    const valB = priorityOrder[String(b).trim()] || 0;

    return valB - valA; // Ascending (Cao first)
  },

  /**
   * Compares status values (Finished > Review > Processing > Ready > Planned > Aborted, ascending)
   * @param {string} a - Status A
   * @param {string} b - Status B
   * @returns {number} - Comparison result
   */
  _compareStatus(a, b) {
    const statusOrder = { 'Finished': 6, 'Review': 5, 'Processing': 4, 'Ready': 3, 'Planned': 2, 'Aborted': 1 };

    const valA = statusOrder[String(a).trim()] || 0;
    const valB = statusOrder[String(b).trim()] || 0;

    return valB - valA; // Ascending (Finished first)
  }
};