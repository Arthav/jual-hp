export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    product_count?: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    images: string[];
    category_id: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    specifications: Record<string, any>;
    is_active: boolean;
    created_at: string;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    product_name: string;
    product_price: number;
    product_image: string | null;
    product_stock: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    shipping_address: ShippingAddress;
    payment_method: string | null;
    notes: string | null;
    items?: OrderItem[];
    created_at: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
