'use client';

import { createCollection } from '@tanstack/db';
import type { Customer, Vendor, Product, PurchaseOrder } from '../types';

// Create individual collections
export const customersCollection = createCollection<Customer, string>({
  id: 'customers',
  getKey: (customer) => customer.id,
  sync: { sync: () => {} },
  onInsert: async () => {}, // No-op handler for local-only data
  onUpdate: async () => {},
  onDelete: async () => {},
});

export const vendorsCollection = createCollection<Vendor, string>({
  id: 'vendors',
  getKey: (vendor) => vendor.id,
  sync: { sync: () => {} },
  onInsert: async () => {},
  onUpdate: async () => {},
  onDelete: async () => {},
});

export const productsCollection = createCollection<Product, string>({
  id: 'products',
  getKey: (product) => product.id,
  sync: { sync: () => {} },
  onInsert: async () => {},
  onUpdate: async () => {},
  onDelete: async () => {},
});

export const purchaseOrdersCollection = createCollection<PurchaseOrder, string>({
  id: 'purchaseOrders',
  getKey: (order) => order.id,
  sync: { sync: () => {} },
  onInsert: async () => {},
  onUpdate: async () => {},
  onDelete: async () => {},
});

// Helper to initialize database with data
export async function initializeDatabase(data: {
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  purchaseOrders?: PurchaseOrder[];
}) {
  // Insert new data (collections start empty)
  for (const customer of data.customers) {
    await customersCollection.insert(customer);
  }
  for (const vendor of data.vendors) {
    await vendorsCollection.insert(vendor);
  }
  for (const product of data.products) {
    await productsCollection.insert(product);
  }
  if (data.purchaseOrders) {
    for (const order of data.purchaseOrders) {
      await purchaseOrdersCollection.insert(order);
    }
  }
}

// Helper to add a purchase order
export async function addPurchaseOrder(order: PurchaseOrder) {
  await purchaseOrdersCollection.insert(order);
}
