import type { SortColumn } from 'react-data-grid';

export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  sortColumns: readonly SortColumn[],
) {
  if (!sortColumns.length) return rows;

  return [...rows].sort((a, b) => {
    for (const { columnKey, direction } of sortColumns) {
      const result = compareValues(
        a[columnKey as keyof T],
        b[columnKey as keyof T],
      );
      if (result !== 0) {
        return direction === 'ASC' ? result : -result;
      }
    }
    return 0;
  });
}
