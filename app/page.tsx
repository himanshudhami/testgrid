'use client';

import { useEffect, useState } from 'react';
import { CustomersGrid } from '@/components/CustomersGrid';
import { VendorsGrid } from '@/components/VendorsGrid';
import { ProductsGrid } from '@/components/ProductsGrid';
import { CreatePurchaseOrder } from '@/components/CreatePurchaseOrder';
import { PurchaseOrdersGrid } from '@/components/PurchaseOrdersGrid';
import { PerformanceDemo } from '@/components/PerformanceDemo';
import { initializeDatabase } from '@/lib/db/client';
import {
  generateCustomers,
  generateVendors,
  generateProducts,
  generatePurchaseOrders,
} from '@/lib/data/generator';

type Tab = 'customers' | 'vendors' | 'products' | 'create-po' | 'purchase-orders' | 'performance';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('performance');
  const [isLoading, setIsLoading] = useState(true);
  const [dataStats, setDataStats] = useState({
    customers: 0,
    vendors: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Generate sample data
      const customers = generateCustomers(5000);
      const vendors = generateVendors(5000);
      const products = generateProducts(5000, vendors);
      const purchaseOrders = generatePurchaseOrders(100, customers, vendors, products);

      // Initialize database
      await initializeDatabase({
        customers,
        vendors,
        products,
        purchaseOrders,
      });

      setDataStats({
        customers: customers.length,
        vendors: vendors.length,
        products: products.length,
        orders: purchaseOrders.length,
      });

      setIsLoading(false);
    };

    loadData();
  }, []);

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'performance', label: 'Performance Demo' },
    { id: 'customers', label: 'Customers', badge: dataStats.customers },
    { id: 'vendors', label: 'Vendors', badge: dataStats.vendors },
    { id: 'products', label: 'Products', badge: dataStats.products },
    { id: 'create-po', label: 'Create Purchase Order' },
    { id: 'purchase-orders', label: 'Purchase Orders', badge: dataStats.orders },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading 15,000+ records into TanStack DB...
          </h2>
          <p className="text-gray-500 mt-2">
            Generating customers, vendors, and products
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Order Management System
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Powered by TanStack DB + React Data Grid
          </p>
        </div>

        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                    {tab.badge.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'performance' && <PerformanceDemo />}
        {activeTab === 'customers' && <CustomersGrid />}
        {activeTab === 'vendors' && <VendorsGrid />}
        {activeTab === 'products' && <ProductsGrid />}
        {activeTab === 'create-po' && <CreatePurchaseOrder />}
        {activeTab === 'purchase-orders' && <PurchaseOrdersGrid />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            Demo app showcasing TanStack DB with {dataStats.customers.toLocaleString()}{' '}
            customers, {dataStats.vendors.toLocaleString()} vendors, and{' '}
            {dataStats.products.toLocaleString()} products
          </p>
          <p className="mt-2">
            Built with Next.js, TanStack DB, and React Data Grid
          </p>
        </div>
      </footer>
    </div>
  );
}
