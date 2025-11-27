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
export function initializeDatabase(data: {
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  purchaseOrders?: PurchaseOrder[];
}) {
  console.log('Initializing database with:', {
    customers: data.customers.length,
    vendors: data.vendors.length,
    products: data.products.length,
    purchaseOrders: data.purchaseOrders?.length ?? 0,
  });

  // Insert new data - no await needed for local collections
  data.customers.forEach(customer => customersCollection.insert(customer));
  console.log('Customers inserted:', customersCollection.size);

  data.vendors.forEach(vendor => vendorsCollection.insert(vendor));
  console.log('Vendors inserted:', vendorsCollection.size);

  data.products.forEach(product => productsCollection.insert(product));
  console.log('Products inserted:', productsCollection.size);

  if (data.purchaseOrders) {
    data.purchaseOrders.forEach(order => purchaseOrdersCollection.insert(order));
    console.log('Purchase orders inserted:', purchaseOrdersCollection.size);
  }

  console.log('Database initialization complete');
}

// Helper to add a purchase order
export function addPurchaseOrder(order: PurchaseOrder) {
  purchaseOrdersCollection.insert(order);
}
