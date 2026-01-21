import { Router } from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/profile', authMiddleware, getProfile);

export default router;
