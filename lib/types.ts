export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  createdAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  category: string;
  rating: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  vendorId: string;
  description: string;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
