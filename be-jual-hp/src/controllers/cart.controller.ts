import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';
import { CartItemWithProduct } from '../types/index.js';

const cartItemSchema = z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Get cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const result = await query<CartItemWithProduct>(
            `SELECT ci.*, p.name as product_name, p.price as product_price, 
              p.images[1] as product_image, p.stock as product_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
            [req.user.userId]
        );

        // Calculate totals
        const items = result.rows;
        const subtotal = items.reduce((sum, item) => sum + (Number(item.product_price) * item.quantity), 0);

        res.json({
            success: true,
            data: {
                items,
                subtotal,
                itemCount: items.length,
            },
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cart',
        });
    }
};

// Add to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const validation = cartItemSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { product_id, quantity } = validation.data;

        // Check product exists and has stock
        const product = await query(
            'SELECT id, stock, is_active FROM products WHERE id = $1',
            [product_id]
        );

        if (product.rows.length === 0 || !product.rows[0].is_active) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        if (product.rows[0].stock < quantity) {
            res.status(400).json({
                success: false,
                error: 'Not enough stock available',
            });
            return;
        }

        // Check if item already in cart
        const existingItem = await query(
            'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
            [req.user.userId, product_id]
        );

        let result;
        if (existingItem.rows.length > 0) {
            // Update quantity
            const newQuantity = existingItem.rows[0].quantity + quantity;
            result = await query(
                `UPDATE cart_items SET quantity = $1, updated_at = NOW() 
         WHERE id = $2 RETURNING *`,
                [newQuantity, existingItem.rows[0].id]
            );
        } else {
            // Insert new item
            result = await query(
                `INSERT INTO cart_items (user_id, product_id, quantity) 
         VALUES ($1, $2, $3) RETURNING *`,
                [req.user.userId, product_id, quantity]
            );
        }

        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add to cart',
        });
    }
};

// Update cart item
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { id } = req.params;
        const validation = updateCartItemSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { quantity } = validation.data;

        // Check cart item exists and belongs to user
        const cartItem = await query(
            `SELECT ci.*, p.stock FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = $1 AND ci.user_id = $2`,
            [id, req.user.userId]
        );

        if (cartItem.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Cart item not found',
            });
            return;
        }

        if (cartItem.rows[0].stock < quantity) {
            res.status(400).json({
                success: false,
                error: 'Not enough stock available',
            });
            return;
        }

        const result = await query(
            `UPDATE cart_items SET quantity = $1, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
            [quantity, id]
        );

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cart item',
        });
    }
};

// Remove from cart
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { id } = req.params;

        const result = await query(
            'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Cart item not found',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Item removed from cart',
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove item from cart',
        });
    }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.userId]);

        res.json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cart',
        });
    }
};
