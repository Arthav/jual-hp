import { Router } from 'express';
import {
    getProducts,
    getProductBySlug,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAdminProducts);
router.post('/admin', authMiddleware, adminMiddleware, createProduct);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
