import { Request, Response } from 'express';
import { z } from 'zod';
import { query, transaction } from '../config/database.js';
import { Order, OrderItem, OrderWithItems } from '../types/index.js';

const shippingAddressSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    province: z.string().min(2, 'Province is required'),
    postal_code: z.string().min(5, 'Postal code is required'),
});

const createOrderSchema = z.object({
    shipping_address: shippingAddressSchema,
    payment_method: z.string().optional(),
    notes: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

// User: Get my orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const countResult = await query(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
            [req.user.userId]
        );
        const total = parseInt(countResult.rows[0].total);

        const result = await query<Order>(
            `SELECT * FROM orders WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [req.user.userId, limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get orders',
        });
    }
};

// User: Get order detail
export const getOrderDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { id } = req.params;

        const orderResult = await query<Order>(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.userId]
        );

        if (orderResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }

        const itemsResult = await query<OrderItem>(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        const order: OrderWithItems = {
            ...orderResult.rows[0],
            items: itemsResult.rows,
        };

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order detail error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get order',
        });
    }
};

// User: Create order from cart
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const validation = createOrderSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { shipping_address, payment_method, notes } = validation.data;

        // Use transaction for order creation
        const order = await transaction(async (client) => {
            // Get cart items
            const cartResult = await client.query(
                `SELECT ci.*, p.name as product_name, p.price as product_price, p.stock
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = $1`,
                [req.user!.userId]
            );

            if (cartResult.rows.length === 0) {
                throw new Error('Cart is empty');
            }

            // Validate stock
            for (const item of cartResult.rows) {
                if (item.stock < item.quantity) {
                    throw new Error(`Not enough stock for ${item.product_name}`);
                }
            }

            // Calculate total
            const total = cartResult.rows.reduce(
                (sum, item) => sum + Number(item.product_price) * item.quantity,
                0
            );

            // Create order
            const orderResult = await client.query<Order>(
                `INSERT INTO orders (user_id, status, total, shipping_address, payment_method, notes)
         VALUES ($1, 'pending', $2, $3, $4, $5) RETURNING *`,
                [req.user!.userId, total, JSON.stringify(shipping_address), payment_method || null, notes || null]
            );

            const newOrder = orderResult.rows[0];

            // Create order items and update stock
            for (const item of cartResult.rows) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
           VALUES ($1, $2, $3, $4, $5)`,
                    [newOrder.id, item.product_id, item.product_name, item.quantity, item.product_price]
                );

                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Clear cart
            await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user!.userId]);

            return newOrder;
        });

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create order',
        });
    }
};

// Admin: Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status as string;

        let whereClause = '';
        const params: any[] = [];

        if (status) {
            whereClause = 'WHERE o.status = $1';
            params.push(status);
        }

        const countResult = await query(
            `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].total);

        const result = await query<Order & { user_email: string; user_name: string }>(
            `SELECT o.*, u.email as user_email, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get orders',
        });
    }
};

// Admin: Get order detail
export const getAdminOrderDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const orderResult = await query<Order & { user_email: string; user_name: string }>(
            `SELECT o.*, u.email as user_email, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
            [id]
        );

        if (orderResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }

        const itemsResult = await query<OrderItem>(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...orderResult.rows[0],
                items: itemsResult.rows,
            },
        });
    } catch (error) {
        console.error('Get admin order detail error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get order',
        });
    }
};

// Admin: Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const validation = updateOrderStatusSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { status } = validation.data;

        const result = await query<Order>(
            `UPDATE orders SET status = $1, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order',
        });
    }
};
