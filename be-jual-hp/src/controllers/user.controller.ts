import { Request, Response } from 'express';
import { query } from '../config/database.js';
import { User, PaginatedResponse } from '../types/index.js';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const countResult = await query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        const result = await query<User>(
            'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users',
        });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.user?.userId) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete yourself',
            });
            return;
        }

        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user',
        });
    }
};
