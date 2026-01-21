import { create } from 'zustand';
import type { Cart, CartItem } from '@/types';
import { cartService } from '@/services/product.service';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;

    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateItem: (id: string, quantity: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const cart = await cartService.getCart();
            set({ cart, isLoading: false });
        } catch {
            set({ cart: null, isLoading: false });
        }
    },

    addToCart: async (productId: string, quantity: number) => {
        await cartService.addToCart(productId, quantity);
        await get().fetchCart();
    },

    updateItem: async (id: string, quantity: number) => {
        await cartService.updateCartItem(id, quantity);
        await get().fetchCart();
    },

    removeItem: async (id: string) => {
        await cartService.removeFromCart(id);
        await get().fetchCart();
    },

    clearCart: async () => {
        await cartService.clearCart();
        set({ cart: null });
    },
}));
