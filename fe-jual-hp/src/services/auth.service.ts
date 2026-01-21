import api from './api';
import type { ApiResponse, LoginResponse, User } from '@/types';

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
            email,
            password,
        });

        if (response.data.success && response.data.data) {
            const { accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return response.data.data;
        }

        throw new Error(response.data.error || 'Login failed');
    },

    async register(email: string, password: string, name: string): Promise<LoginResponse> {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', {
            email,
            password,
            name,
        });

        if (response.data.success && response.data.data) {
            const { accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return response.data.data;
        }

        throw new Error(response.data.error || 'Registration failed');
    },

    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    async getProfile(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/profile');

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.error || 'Failed to get profile');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    },
};
