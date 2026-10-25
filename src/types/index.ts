export type ProductCategory = 
  | 'smartphones'
  | 'laptops'
  | 'tablets'
  | 'chargers'
  | 'earpieces'
  | 'powerbanks'
  | 'smartwatches'
  | 'phonecases'
  | 'screenprotectors'
  | 'accessories';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  price: number; // in Nigerian Naira (₦)
  originalPrice?: number;
  stock: number;
  images: string[];
  description: string;
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedVariant?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'ready_for_pickup'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'cash_on_pickup';

export type PaymentStatus = 
  | 'unpaid'
  | 'pending_verification'
  | 'paid'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. ICON-ORD-74921
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RepairStatus = 
  | 'Received'
  | 'Diagnosing'
  | 'Awaiting Customer Approval'
  | 'Awaiting Parts'
  | 'Repairing'
  | 'Ready for Collection'
  | 'Completed'
  | 'Cancelled';

export interface RepairJob {
  id: string; // e.g. ICON-REP-38912
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  gadgetType: string; // Smartphone, Laptop, Tablet, Smartwatch, etc.
  brandModel: string; // e.g. iPhone 13 Pro Max, HP Envy x360
  faultCategory: string; // Screen, Battery, Charging Port, etc.
  faultDescription: string;
  photoUrl?: string;
  passcodeProvided?: string;
  repairStatus: RepairStatus;
  quotedPrice?: number;
  diagnosticNotes?: string;
  estimatedCompletion?: string;
  paymentStatus?: 'unpaid' | 'deposit_paid' | 'paid';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'technician' | 'sales_manager';
  createdAt?: string;
}

export interface CategoryItem {
  id: ProductCategory;
  label: string;
  iconName: string;
  description: string;
  itemCount?: number;
  featuredImg: string;
  localVectorImg?: string;
}
