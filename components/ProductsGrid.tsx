'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column, type SortColumn } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { productsCollection, vendorsCollection } from '@/lib/db/client';
import type { Product, Vendor } from '@/lib/types';
import { sortRows } from '@/lib/utils/sorting';
import 'react-data-grid/lib/styles.css';

interface ProductWithVendor extends Product {
  vendorName?: string;
  vendorCompany?: string;
}

interface Props {
  selectedVendorId?: string;
}

export function ProductsGrid({ selectedVendorId }: Props) {
  const [searchText, setSearchText] = useState('');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    { columnKey: 'name', direction: 'ASC' },
  ]);

  // Use TanStack DB reactive queries
  const { data: productsData } = useLiveQuery(() => productsCollection);
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const products = useMemo(
    () => (productsData ?? []) as unknown as Product[],
    [productsData]
  );
  const vendors = useMemo(
    () => (vendorsData ?? []) as unknown as Vendor[],
    [vendorsData]
  );

  // Join products with vendor data
  const productsWithVendor = useMemo<ProductWithVendor[]>(() => {
    return products.map((product) => {
      const vendor = vendors.find((v) => v.id === product.vendorId);
      return {
        ...product,
        vendorName: vendor?.name,
        vendorCompany: vendor?.company,
      };
    });
  }, [products, vendors]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = productsWithVendor;

    // Filter by vendor if specified
    if (selectedVendorId) {
      filtered = filtered.filter((p) => p.vendorId === selectedVendorId);
    }

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.vendorCompany?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [productsWithVendor, searchText, selectedVendorId]);

  const sortedProducts = useMemo(
    () => sortRows(filteredProducts, sortColumns),
    [filteredProducts, sortColumns]
  );

  const columns: Column<ProductWithVendor>[] = [
    { key: 'id', name: 'ID', width: 100, frozen: true },
    { key: 'name', name: 'Product Name', width: 200, sortable: true },
    { key: 'sku', name: 'SKU', width: 130, sortable: true },
    { key: 'category', name: 'Category', width: 150, sortable: true },
    { key: 'price', name: 'Price', width: 100, sortable: true,
      renderCell: ({ row }) => `$${row.price.toFixed(2)}` },
    { key: 'stock', name: 'Stock', width: 90, sortable: true },
    { key: 'vendorCompany', name: 'Vendor', width: 180, sortable: true },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-md"
        />
        <div className="text-sm text-gray-600">
          Showing {sortedProducts.length} of {products.length} products
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          rows={sortedProducts}
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
