'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import { useLiveQuery } from '@tanstack/react-db';
import { productsCollection, vendorsCollection } from '@/lib/db/client';
import type { Product, Vendor } from '@/lib/types';
import 'react-data-grid/lib/styles.css';

interface ProductWithVendor extends Product {
  vendorName?: string;
  vendorCompany?: string;
}

interface Props {
  onSelectProduct?: (product: Product) => void;
  selectedVendorId?: string;
}

export function ProductsGrid({ onSelectProduct, selectedVendorId }: Props) {
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use TanStack DB reactive queries
  const { data: productsData } = useLiveQuery(() => productsCollection);
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const products = (productsData ?? []) as unknown as Product[];
  const vendors = (vendorsData ?? []) as unknown as Vendor[];

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

  // Filter and sort products
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

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortColumn as keyof ProductWithVendor];
      const bVal = b[sortColumn as keyof ProductWithVendor];

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [productsWithVendor, searchText, sortColumn, sortDirection, selectedVendorId]);

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
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-md"
        />
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataGrid
          columns={columns}
          rows={filteredProducts}
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
