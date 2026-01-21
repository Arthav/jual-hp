export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    created_at: Date;
    updated_at: Date;
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
    specifications: Record<string, any>;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ProductWithCategory extends Product {
    category_name: string | null;
    category_slug: string | null;
}

export interface Order {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    shipping_address: ShippingAddress;
    payment_method: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
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
    created_at: Date;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: Date;
    updated_at: Date;
}

export interface CartItemWithProduct extends CartItem {
    product_name: string;
    product_price: number;
    product_image: string | null;
    product_stock: number;
}

export interface RefreshToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
