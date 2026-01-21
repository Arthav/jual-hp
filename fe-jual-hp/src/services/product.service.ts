import api from './api';
import type { ApiResponse, PaginatedResponse, Product, Category, Cart, CartItem, Order } from '@/types';

export const productService = {
    async getProducts(params?: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Product>> {
        const response = await api.get<PaginatedResponse<Product>>('/products', { params });
        return response.data;
    },

    async getProductBySlug(slug: string): Promise<Product> {
        const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Product not found');
    },
};

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get categories');
    },
};

export const cartService = {
    async getCart(): Promise<Cart> {
        const response = await api.get<ApiResponse<Cart>>('/cart');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cart');
    },

    async addToCart(productId: string, quantity: number): Promise<CartItem> {
        const response = await api.post<ApiResponse<CartItem>>('/cart', {
            product_id: productId,
            quantity,
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to add to cart');
    },

    async updateCartItem(id: string, quantity: number): Promise<CartItem> {
        const response = await api.put<ApiResponse<CartItem>>(`/cart/${id}`, { quantity });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cart');
    },

    async removeFromCart(id: string): Promise<void> {
        await api.delete(`/cart/${id}`);
    },

    async clearCart(): Promise<void> {
        await api.delete('/cart');
    },
};

export const orderService = {
    async createOrder(data: {
        shipping_address: {
            name: string;
            phone: string;
            address: string;
            city: string;
            province: string;
            postal_code: string;
        };
        payment_method?: string;
        notes?: string;
    }): Promise<Order> {
        const response = await api.post<ApiResponse<Order>>('/orders', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create order');
    },

    async getMyOrders(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
        const response = await api.get<PaginatedResponse<Order>>('/orders/my', {
            params: { page, limit },
        });
        return response.data;
    },

    async getOrderDetail(id: string): Promise<Order> {
        const response = await api.get<ApiResponse<Order>>(`/orders/my/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Order not found');
    },
};
