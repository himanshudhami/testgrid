'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column, type SortColumn } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { vendorsCollection } from '@/lib/db/client';
import type { Vendor } from '@/lib/types';
import { sortRows } from '@/lib/utils/sorting';
import 'react-data-grid/lib/styles.css';

export function VendorsGrid() {
  const [searchText, setSearchText] = useState('');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    { columnKey: 'name', direction: 'ASC' },
  ]);

  // Use TanStack DB reactive query
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const vendors = useMemo(
    () => (vendorsData ?? []) as unknown as Vendor[],
    [vendorsData]
  );

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!searchText) return vendors;

    const search = searchText.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search) ||
        v.company.toLowerCase().includes(search) ||
        v.category.toLowerCase().includes(search)
    );
  }, [vendors, searchText]);

  const sortedVendors = useMemo(
    () => sortRows(filteredVendors, sortColumns),
    [filteredVendors, sortColumns]
  );

  const columns: Column<Vendor>[] = [
    { key: 'id', name: 'ID', width: 100, frozen: true },
    { key: 'name', name: 'Name', width: 180, sortable: true },
    { key: 'company', name: 'Company', width: 180, sortable: true },
    { key: 'category', name: 'Category', width: 140, sortable: true },
    { key: 'rating', name: 'Rating', width: 90, sortable: true },
    { key: 'email', name: 'Email', width: 220 },
    { key: 'city', name: 'City', width: 130, sortable: true },
    { key: 'country', name: 'Country', width: 130, sortable: true },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-md"
        />
        <div className="text-sm text-gray-600">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          rows={sortedVendors}
          rowKeyGetter={(row) => row.id}
          className="fill-grid"
          style={{ height: '600px' }}
          headerRowHeight={40}
          rowHeight={35}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
        />
      </div>
    </div>
  );
}
