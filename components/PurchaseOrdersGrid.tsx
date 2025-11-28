'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column, type SortColumn } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { purchaseOrdersCollection, customersCollection, vendorsCollection } from '@/lib/db/client';
import type { PurchaseOrder, Customer, Vendor } from '@/lib/types';
import { sortRows } from '@/lib/utils/sorting';
import 'react-data-grid/lib/styles.css';

interface PurchaseOrderWithDetails extends PurchaseOrder {
  customerName?: string;
  vendorName?: string;
  itemCount: number;
}

export function PurchaseOrdersGrid() {
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    { columnKey: 'createdAt', direction: 'DESC' },
  ]);

  // Use TanStack DB reactive queries with joins
  const { data: ordersData } = useLiveQuery(() => purchaseOrdersCollection);
  const { data: customersData } = useLiveQuery(() => customersCollection);
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const orders = useMemo(
    () => (ordersData ?? []) as unknown as PurchaseOrder[],
    [ordersData]
  );
  const customers = useMemo(
    () => (customersData ?? []) as unknown as Customer[],
    [customersData]
  );
  const vendors = useMemo(
    () => (vendorsData ?? []) as unknown as Vendor[],
    [vendorsData]
  );

  // Join orders with customer and vendor data
  const ordersWithDetails = useMemo<PurchaseOrderWithDetails[]>(() => {
    return orders.map((order) => {
      const customer = customers.find((c) => c.id === order.customerId);
      const vendor = vendors.find((v) => v.id === order.vendorId);

      return {
        ...order,
        customerName: customer?.name,
        vendorName: vendor?.name,
        itemCount: order.items.length,
      };
    });
  }, [orders, customers, vendors]);

  // Sort orders
  const sortedOrders = useMemo(
    () => sortRows(ordersWithDetails, sortColumns),
    [ordersWithDetails, sortColumns]
  );

  const columns: Column<PurchaseOrderWithDetails>[] = [
    { key: 'orderNumber', name: 'Order Number', width: 180, frozen: true },
    { key: 'customerName', name: 'Customer', width: 180, sortable: true },
    { key: 'vendorName', name: 'Vendor', width: 180, sortable: true },
    {
      key: 'itemCount',
      name: 'Items',
      width: 80,
      sortable: true,
      renderCell: ({ row }) => (
        <div className="text-center">{row.itemCount}</div>
      ),
    },
    {
      key: 'totalAmount',
      name: 'Total',
      width: 120,
      sortable: true,
      renderCell: ({ row }) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      key: 'status',
      name: 'Status',
      width: 120,
      sortable: true,
      renderCell: ({ row }) => {
        const colors = {
          draft: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          completed: 'bg-blue-100 text-blue-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              colors[row.status]
            }`}
          >
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      name: 'Created',
      width: 160,
      sortable: true,
      renderCell: ({ row }) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-xl font-bold">Purchase Orders</h2>
        <div className="text-sm text-gray-600">
          Total: {orders.length} orders | Total value: $
          {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          rows={sortedOrders}
          rowKeyGetter={(row) => row.id}
          className="fill-grid"
          style={{ height: '600px' }}
          headerRowHeight={40}
          rowHeight={45}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
        />
      </div>
    </div>
  );
}
