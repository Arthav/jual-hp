import { Router } from 'express';
import { uploadImages } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Admin-only: Upload multiple images
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 10), uploadImages);

export default router;
