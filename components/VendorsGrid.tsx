'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { vendorsCollection } from '@/lib/db/client';
import type { Vendor } from '@/lib/types';
import 'react-data-grid/lib/styles.css';

interface Props {
  onSelectVendor?: (vendor: Vendor) => void;
}

export function VendorsGrid({ onSelectVendor }: Props) {
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use TanStack DB reactive query
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const vendors = (vendorsData ?? []) as unknown as Vendor[];

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.email.toLowerCase().includes(search) ||
          v.company.toLowerCase().includes(search) ||
          v.category.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortColumn as keyof Vendor];
      const bVal = b[sortColumn as keyof Vendor];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vendors, searchText, sortColumn, sortDirection]);

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

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

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
          rows={filteredVendors}
          rowKeyGetter={(row) => row.id}
          className="fill-grid"
          style={{ height: '600px' }}
          headerRowHeight={40}
          rowHeight={35}
        />
      </div>
    </div>
  );
}
