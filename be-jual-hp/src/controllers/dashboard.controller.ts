import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Products
        const productsQuery = await pool.query('SELECT COUNT(*) FROM products');
        const totalProducts = parseInt(productsQuery.rows[0].count);

        // 2. Total Orders
        const ordersQuery = await pool.query('SELECT COUNT(*) FROM orders');
        const totalOrders = parseInt(ordersQuery.rows[0].count);

        // 3. Total Users (functioning as "Active Users" for now)
        const usersQuery = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'user\'');
        const totalUsers = parseInt(usersQuery.rows[0].count);

        // 4. Total Revenue (sum of delivered orders)
        const revenueQuery = await pool.query("SELECT SUM(total) FROM orders WHERE status = 'delivered'");
        const totalRevenue = parseFloat(revenueQuery.rows[0].sum || '0');

        // 5. Recent Orders (limit 5)
        // We get the first product name for display purposes if multiple items exist
        const recentOrdersQuery = await pool.query(`
            SELECT 
                o.id, 
                u.name as customer, 
                o.total, 
                o.status,
                (SELECT product_name FROM order_items WHERE order_id = o.id LIMIT 1) as product
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        `);
        const recentOrders = recentOrdersQuery.rows.map((row: any) => ({
            id: row.id,
            customer: row.customer,
            product: row.product || 'Unknown Product',
            total: parseFloat(row.total),
            status: row.status
        }));

        // 6. Low Stock Products (count < 10)
        const lowStockQuery = await pool.query('SELECT COUNT(*) FROM products WHERE stock < 10');
        const lowStockCount = parseInt(lowStockQuery.rows[0].count);

        // 7. Pending Orders (count status = 'pending')
        const pendingOrdersQuery = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        const pendingOrdersCount = parseInt(pendingOrdersQuery.rows[0].count);

        res.json({
            success: true,
            data: {
                stats: {
                    totalProducts,
                    totalOrders,
                    totalUsers,
                    totalRevenue
                },
                recentOrders,
                alerts: {
                    lowStock: lowStockCount,
                    pendingOrders: pendingOrdersCount
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
};
