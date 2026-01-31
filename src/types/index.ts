// Product Types
export type ProductCategory = 'LAPTOP' | 'DESKTOP' | 'ACCESSORY';

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  stock: number;
  imageUrl: string;
  additionalImages: string[];
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screenSize?: string;
  os?: string;
  additionalSpecs?: string;
  isNew: boolean;
  isBestSeller: boolean;
  isPromo: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productBrand: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productBrand: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryFirstName: string;
  deliveryLastName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryRegion?: string;
  deliveryNotes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// User Types
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
}

// Auth Types
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// API Response Types
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Form Types
export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  deliveryFirstName: string;
  deliveryLastName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryRegion?: string;
  deliveryNotes?: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}
