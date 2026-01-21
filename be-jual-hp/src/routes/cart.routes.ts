import { Router } from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
