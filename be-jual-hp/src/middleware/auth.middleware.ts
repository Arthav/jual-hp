import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { TokenPayload } from '../types/index.js';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
            });
            return;
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyAccessToken(token);

        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
};

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Admin access required',
            });
            return;
        }

        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            error: 'Access denied',
        });
    }
};

export const optionalAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = verifyAccessToken(token);
            req.user = payload;
        }

        next();
    } catch (error) {
        // Token invalid, but continue without auth
        next();
    }
};
