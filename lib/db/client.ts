'use client';

import { createCollection, localOnlyCollectionOptions } from '@tanstack/db';
import type { Customer, Vendor, Product, PurchaseOrder } from '../types';

// Create local-only collections (in-memory, no sync layer)
export const customersCollection = createCollection(
  localOnlyCollectionOptions<Customer>({
    id: 'customers',
    getKey: (customer) => customer.id,
  })
);

export const vendorsCollection = createCollection(
  localOnlyCollectionOptions<Vendor>({
    id: 'vendors',
    getKey: (vendor) => vendor.id,
  })
);

export const productsCollection = createCollection(
  localOnlyCollectionOptions<Product>({
    id: 'products',
    getKey: (product) => product.id,
  })
);

export const purchaseOrdersCollection = createCollection(
  localOnlyCollectionOptions<PurchaseOrder>({
    id: 'purchaseOrders',
    getKey: (order) => order.id,
  })
);

// Helper to initialize database with data
function getCollectionSize<T extends object>(collection: { values: () => IterableIterator<T>; size?: number }) {
  return typeof collection.size === 'number'
    ? collection.size
    : Array.from(collection.values()).length;
}

export function getCollectionCounts() {
  return {
    customers: getCollectionSize(customersCollection),
    vendors: getCollectionSize(vendorsCollection),
    products: getCollectionSize(productsCollection),
    orders: getCollectionSize(purchaseOrdersCollection),
  };
}

export function initializeDatabase(data: {
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  purchaseOrders?: PurchaseOrder[];
}) {
  const existingCounts = getCollectionCounts();
  const alreadySeeded = Object.values(existingCounts).some((count) => count > 0);

  if (alreadySeeded) {
    console.info('Database already has data, skipping re-seed');
    return existingCounts;
  }

  console.log('Initializing database with:', {
    customers: data.customers.length,
    vendors: data.vendors.length,
    products: data.products.length,
    purchaseOrders: data.purchaseOrders?.length ?? 0,
  });

  customersCollection.insert(data.customers);
  vendorsCollection.insert(data.vendors);
  productsCollection.insert(data.products);

  if (data.purchaseOrders?.length) {
    purchaseOrdersCollection.insert(data.purchaseOrders);
  }

  const seededCounts = getCollectionCounts();
  console.log('Database initialization complete', seededCounts);
  return seededCounts;
}

// Helper to add a purchase order
export function addPurchaseOrder(order: PurchaseOrder) {
  purchaseOrdersCollection.insert(order);
}
