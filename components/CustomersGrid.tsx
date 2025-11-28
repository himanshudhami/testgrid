'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column, type SortColumn } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { customersCollection } from '@/lib/db/client';
import type { Customer } from '@/lib/types';
import { sortRows } from '@/lib/utils/sorting';
import 'react-data-grid/lib/styles.css';

export function CustomersGrid() {
  const [searchText, setSearchText] = useState('');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    { columnKey: 'name', direction: 'ASC' },
  ]);

  // Use TanStack DB reactive query
  const { data: customersData } = useLiveQuery(() => customersCollection);
  const customers = useMemo(
    () => (customersData ?? []) as unknown as Customer[],
    [customersData]
  );

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;

    const search = searchText.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.company.toLowerCase().includes(search)
    );
  }, [customers, searchText]);

  const sortedCustomers = useMemo(
    () => sortRows(filteredCustomers, sortColumns),
    [filteredCustomers, sortColumns]
  );

  const columns: Column<Customer>[] = [
    { key: 'id', name: 'ID', width: 100, frozen: true },
    { key: 'name', name: 'Name', width: 180, sortable: true },
    { key: 'email', name: 'Email', width: 220, sortable: true },
    { key: 'phone', name: 'Phone', width: 150 },
    { key: 'company', name: 'Company', width: 180, sortable: true },
    { key: 'city', name: 'City', width: 130, sortable: true },
    { key: 'country', name: 'Country', width: 130, sortable: true },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-md"
        />
        <div className="text-sm text-gray-600">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          rows={sortedCustomers}
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
