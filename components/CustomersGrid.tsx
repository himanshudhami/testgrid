'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { customersCollection } from '@/lib/db/client';
import type { Customer } from '@/lib/types';
import 'react-data-grid/lib/styles.css';

interface Props {
  onSelectCustomer?: (customer: Customer) => void;
}

export function CustomersGrid({ onSelectCustomer }: Props) {
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use TanStack DB reactive query
  const { data: customersData } = useLiveQuery(() => customersCollection);
  const customers = (customersData ?? []) as unknown as Customer[];

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.company.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortColumn as keyof Customer];
      const bVal = b[sortColumn as keyof Customer];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchText, sortColumn, sortDirection]);

  const columns: Column<Customer>[] = [
    { key: 'id', name: 'ID', width: 100, frozen: true },
    { key: 'name', name: 'Name', width: 180, sortable: true },
    { key: 'email', name: 'Email', width: 220, sortable: true },
    { key: 'phone', name: 'Phone', width: 150 },
    { key: 'company', name: 'Company', width: 180, sortable: true },
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
          rows={filteredCustomers}
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
