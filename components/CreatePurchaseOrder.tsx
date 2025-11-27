'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { customersCollection, vendorsCollection, productsCollection, addPurchaseOrder } from '@/lib/db/client';
import type { Customer, Vendor, Product, PurchaseOrder, PurchaseOrderItem } from '@/lib/types';

interface SelectedProduct {
  product: Product;
  quantity: number;
}

export function CreatePurchaseOrder() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchVendor, setSearchVendor] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Use TanStack DB reactive queries
  const { data: customersData } = useLiveQuery(() => customersCollection);
  const { data: vendorsData } = useLiveQuery(() => vendorsCollection);
  const { data: productsData } = useLiveQuery(() => productsCollection);

  const customers = (customersData ?? []) as unknown as Customer[];
  const vendors = (vendorsData ?? []) as unknown as Vendor[];
  const products = (productsData ?? []) as unknown as Product[];

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchCustomer) return customers.slice(0, 10);
    const search = searchCustomer.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.company.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [customers, searchCustomer]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!searchVendor) return vendors.slice(0, 10);
    const search = searchVendor.toLowerCase();
    return vendors
      .filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.company.toLowerCase().includes(search) ||
          v.category.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [vendors, searchVendor]);

  // Filter products for selected vendor
  const availableProducts = useMemo(() => {
    if (!selectedVendor) return [];

    let filtered = products.filter((p) => p.vendorId === selectedVendor.id);

    if (searchProduct) {
      const search = searchProduct.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    return filtered.slice(0, 20);
  }, [products, selectedVendor, searchProduct]);

  // Calculate total
  const totalAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [selectedProducts]);

  const handleAddProduct = (product: Product) => {
    const existing = selectedProducts.find((sp) => sp.product.id === product.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((sp) =>
          sp.product.id === product.id ? { ...sp, quantity: sp.quantity + 1 } : sp
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter((sp) => sp.product.id !== productId));
    } else {
      setSelectedProducts(
        selectedProducts.map((sp) =>
          sp.product.id === productId ? { ...sp, quantity } : sp
        )
      );
    }
  };

  const handleCreateOrder = () => {
    if (!selectedCustomer || !selectedVendor || selectedProducts.length === 0) {
      alert('Please select a customer, vendor, and at least one product');
      return;
    }

    const items: PurchaseOrderItem[] = selectedProducts.map((sp) => ({
      productId: sp.product.id,
      quantity: sp.quantity,
      price: sp.product.price,
    }));

    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const order: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      orderNumber,
      customerId: selectedCustomer.id,
      vendorId: selectedVendor.id,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addPurchaseOrder(order);

    // Reset form
    setSelectedCustomer(null);
    setSelectedVendor(null);
    setSelectedProducts([]);
    setSearchCustomer('');
    setSearchVendor('');
    setSearchProduct('');
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create Purchase Order</h2>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Purchase order created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Select Customer</h3>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
          />
          {selectedCustomer ? (
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium">{selectedCustomer.name}</div>
              <div className="text-sm text-gray-600">{selectedCustomer.company}</div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded border border-gray-200"
                >
                  <div className="font-medium text-sm">{customer.name}</div>
                  <div className="text-xs text-gray-600">{customer.company}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vendor Selection */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Select Vendor</h3>
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchVendor}
            onChange={(e) => setSearchVendor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
          />
          {selectedVendor ? (
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium">{selectedVendor.name}</div>
              <div className="text-sm text-gray-600">{selectedVendor.company}</div>
              <div className="text-xs text-gray-500">{selectedVendor.category}</div>
              <button
                onClick={() => {
                  setSelectedVendor(null);
                  setSelectedProducts([]);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded border border-gray-200"
                >
                  <div className="font-medium text-sm">{vendor.name}</div>
                  <div className="text-xs text-gray-600">{vendor.company}</div>
                  <div className="text-xs text-gray-500">{vendor.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Selection */}
      {selectedVendor && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Add Products</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {availableProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className="p-3 hover:bg-gray-100 cursor-pointer rounded border border-gray-200"
              >
                <div className="font-medium text-sm">{product.name}</div>
                <div className="text-xs text-gray-600">{product.sku}</div>
                <div className="text-sm font-semibold text-green-600">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Stock: {product.stock}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {selectedProducts.map((sp) => (
              <div
                key={sp.product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">{sp.product.name}</div>
                  <div className="text-sm text-gray-600">
                    ${sp.product.price.toFixed(2)} each
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={sp.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(sp.product.id, parseInt(e.target.value) || 0)
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <div className="font-semibold w-24 text-right">
                    ${(sp.product.price * sp.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleUpdateQuantity(sp.product.id, 0)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={!selectedCustomer || !selectedVendor || selectedProducts.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Purchase Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
