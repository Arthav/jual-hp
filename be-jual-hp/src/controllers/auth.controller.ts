import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/database.js';
import { generateTokens, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.js';
import { User } from '../types/index.js';
import { ApiError } from '../middleware/error.middleware.js';

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { email, password, name } = validation.data;

        // Check if user exists
        const existingUser = await query<User>(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Email already registered',
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await query<User>(
            `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, email, name, role, created_at`,
            [email, hashedPassword, name]
        );

        const user = result.rows[0];

        // Generate tokens
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Store refresh token
        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
            [user.id, tokens.refreshToken, getRefreshTokenExpiry()]
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                ...tokens,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { email, password } = validation.data;

        // Find user
        const result = await query<User>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Generate tokens
        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Store refresh token
        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
            [user.id, tokens.refreshToken, getRefreshTokenExpiry()]
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                ...tokens,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            res.status(400).json({
                success: false,
                error: 'Refresh token required',
            });
            return;
        }

        // Verify refresh token
        const payload = verifyRefreshToken(token);

        // Check if token exists in database
        const tokenResult = await query(
            `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token',
            });
            return;
        }

        // Delete old token
        await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

        // Generate new tokens
        const tokens = generateTokens({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });

        // Store new refresh token
        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
            [payload.userId, tokens.refreshToken, getRefreshTokenExpiry()]
        );

        res.json({
            success: true,
            data: tokens,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: 'Token refresh failed',
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (token) {
            await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
        });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const result = await query<User>(
            'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile',
        });
    }
};
