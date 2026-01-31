import type {
  Product,
  Cart,
  Order,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  PageResponse,
  CreateOrderRequest,
  AddToCartRequest,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function for API calls
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
    throw new Error(error.message || 'Une erreur est survenue');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string): Promise<AuthResponse> =>
    fetchApi(`/auth/refresh-token?refreshToken=${refreshToken}`, { method: 'POST' }),
};

// Products API
export const productsApi = {
  getAll: (page = 0, size = 12, sortBy = 'createdAt', direction = 'DESC'): Promise<PageResponse<Product>> =>
    fetchApi(`/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

  getById: (id: number): Promise<Product> =>
    fetchApi(`/products/${id}`),

  getByCategory: (category: string, page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/category/${category}?page=${page}&size=${size}`),

  getByBrand: (brand: string, page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/brand/${brand}?page=${page}&size=${size}`),

  getPromo: (page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/promo?page=${page}&size=${size}`),

  getBestSellers: (page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/bestsellers?page=${page}&size=${size}`),

  getNew: (page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/new?page=${page}&size=${size}`),

  search: (keyword: string, page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),

  getByPriceRange: (minPrice: number, maxPrice: number, page = 0, size = 12): Promise<PageResponse<Product>> =>
    fetchApi(`/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`),

  getAllBrands: (): Promise<string[]> =>
    fetchApi('/products/brands'),
};

// Cart API
export const cartApi = {
  get: (): Promise<Cart> =>
    fetchApi('/cart'),

  addItem: (data: AddToCartRequest): Promise<Cart> =>
    fetchApi('/cart/add', { method: 'POST', body: JSON.stringify(data) }),

  updateItem: (itemId: number, quantity: number): Promise<Cart> =>
    fetchApi(`/cart/items/${itemId}?quantity=${quantity}`, { method: 'PUT' }),

  removeItem: (itemId: number): Promise<Cart> =>
    fetchApi(`/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: (): Promise<void> =>
    fetchApi('/cart/clear', { method: 'DELETE' }),
};

// Orders API
export const ordersApi = {
  create: (data: CreateOrderRequest): Promise<Order> =>
    fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),

  getById: (id: number): Promise<Order> =>
    fetchApi(`/orders/${id}`),

  getMyOrders: (page = 0, size = 10): Promise<PageResponse<Order>> =>
    fetchApi(`/orders/my-orders?page=${page}&size=${size}`),

  cancel: (id: number, reason?: string): Promise<Order> =>
    fetchApi(`/orders/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, { method: 'PUT' }),
};
