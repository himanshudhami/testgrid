import { faker } from '@faker-js/faker';
import type { Customer, Vendor, Product, PurchaseOrder } from '../types';

export function generateCustomers(count: number): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    customers.push({
      id: `CUST-${i + 1}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      createdAt: faker.date.past({ years: 2 }),
    });
  }

  return customers;
}

export function generateVendors(count: number): Vendor[] {
  const vendors: Vendor[] = [];
  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Software', 'Hardware', 'Services'];

  for (let i = 0; i < count; i++) {
    vendors.push({
      id: `VEND-${i + 1}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      category: faker.helpers.arrayElement(categories),
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
      createdAt: faker.date.past({ years: 2 }),
    });
  }

  return vendors;
}

export function generateProducts(count: number, vendors: Vendor[]): Product[] {
  const products: Product[] = [];
  const categories = [
    'Laptops', 'Monitors', 'Keyboards', 'Mice', 'Desks', 'Chairs',
    'Headphones', 'Webcams', 'Printers', 'Cables', 'Software Licenses', 'Storage Devices'
  ];

  for (let i = 0; i < count; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    products.push({
      id: `PROD-${i + 1}`,
      name: faker.commerce.productName(),
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      category: faker.helpers.arrayElement(categories),
      price: parseFloat(faker.commerce.price({ min: 10, max: 5000, dec: 2 })),
      stock: faker.number.int({ min: 0, max: 1000 }),
      vendorId: vendor.id,
      description: faker.commerce.productDescription(),
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  return products;
}

export function generatePurchaseOrders(
  count: number,
  customers: Customer[],
  vendors: Vendor[],
  products: Product[]
): PurchaseOrder[] {
  const orders: PurchaseOrder[] = [];
  const statuses: PurchaseOrder['status'][] = ['draft', 'pending', 'approved', 'rejected', 'completed'];

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const vendorProducts = products.filter(p => p.vendorId === vendor.id);

    if (vendorProducts.length === 0) continue;

    const itemCount = faker.number.int({ min: 1, max: 5 });
    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
      const quantity = faker.number.int({ min: 1, max: 10 });
      const price = product.price;

      items.push({
        productId: product.id,
        quantity,
        price,
      });

      totalAmount += quantity * price;
    }

    const createdAt = faker.date.past({ years: 1 });

    orders.push({
      id: `PO-${i + 1}`,
      orderNumber: `PO-${faker.string.alphanumeric(10).toUpperCase()}`,
      customerId: customer.id,
      vendorId: vendor.id,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: faker.helpers.arrayElement(statuses),
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    });
  }

  return orders;
}
