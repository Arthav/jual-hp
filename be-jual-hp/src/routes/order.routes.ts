import { Router } from 'express';
import {
    getMyOrders,
    getOrderDetail,
    createOrder,
    getAllOrders,
    getAdminOrderDetail,
    updateOrderStatus,
} from '../controllers/order.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// User routes (require authentication)
router.get('/my', authMiddleware, getMyOrders);
router.get('/my/:id', authMiddleware, getOrderDetail);
router.post('/', authMiddleware, createOrder);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/admin/:id', authMiddleware, adminMiddleware, getAdminOrderDetail);
router.put('/admin/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
