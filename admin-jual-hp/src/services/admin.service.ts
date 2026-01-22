import api from './api';

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
    specifications: Record<string, any>;
    is_active: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    product_count?: number;
}

export interface Order {
    id: string;
    user_id: string;
    user_email?: string;
    user_name?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    shipping_address: any;
    items?: any[];
    created_at: string;
}

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const adminProductService = {
    async getProducts(page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
        const response = await api.get<PaginatedResponse<Product>>('/products/admin/all', { params: { page, limit } });
        return response.data;
    },

    async createProduct(data: Partial<Product>): Promise<Product> {
        const response = await api.post<ApiResponse<Product>>('/products/admin', data);
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to create product');
    },

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        const response = await api.put<ApiResponse<Product>>(`/products/admin/${id}`, data);
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to update product');
    },

    async deleteProduct(id: string): Promise<void> {
        await api.delete(`/products/admin/${id}`);
    },
};

export const adminCategoryService = {
    async getCategories(): Promise<Category[]> {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to get categories');
    },

    async createCategory(data: { name: string; image?: string }): Promise<Category> {
        const response = await api.post<ApiResponse<Category>>('/categories/admin', data);
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to create category');
    },

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        const response = await api.put<ApiResponse<Category>>(`/categories/admin/${id}`, data);
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to update category');
    },

    async deleteCategory(id: string): Promise<void> {
        await api.delete(`/categories/admin/${id}`);
    },
};

export const adminOrderService = {
    async getOrders(page = 1, limit = 20, status?: string): Promise<PaginatedResponse<Order>> {
        const response = await api.get<PaginatedResponse<Order>>('/orders/admin/all', { params: { page, limit, status } });
        return response.data;
    },

    async getOrderDetail(id: string): Promise<Order> {
        const response = await api.get<ApiResponse<Order>>(`/orders/admin/${id}`);
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Order not found');
    },

    async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
        const response = await api.put<ApiResponse<Order>>(`/orders/admin/${id}/status`, { status });
        if (response.data.success && response.data.data) return response.data.data;
        throw new Error(response.data.error || 'Failed to update order');
    },
};

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    created_at: string;
}

export const adminUserService = {
    async getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
        const response = await api.get<PaginatedResponse<User>>('/users', { params: { page, limit } });
        return response.data;
    },

    async deleteUser(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};

