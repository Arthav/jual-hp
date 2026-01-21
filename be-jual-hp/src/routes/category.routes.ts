import { Router } from 'express';
import {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.post('/admin', authMiddleware, adminMiddleware, createCategory);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
