import { Router } from 'express';
import { getUsers, deleteUser } from '../controllers/user.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getUsers);
router.delete('/:id', deleteUser);

export default router;
