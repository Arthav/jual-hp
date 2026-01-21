import { create } from 'zustand';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
        const data = await authService.login(email, password);
        set({ user: data.user, isAuthenticated: true });
    },

    register: async (email: string, password: string, name: string) => {
        const data = await authService.register(email, password, name);
        set({ user: data.user, isAuthenticated: true });
    },

    logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        try {
            if (!authService.isAuthenticated()) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
