import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';
import { Category } from '../types/index.js';
import { slugify, generateUniqueSlug } from '../utils/helpers.js';

const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    image: z.string().optional().nullable(),
});

// Public: Get all categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query<Category & { product_count: number }>(
            `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
       GROUP BY c.id
       ORDER BY c.name ASC`
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get categories',
        });
    }
};

// Public: Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const result = await query<Category>(
            'SELECT * FROM categories WHERE slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Category not found',
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category',
        });
    }
};

// Admin: Create category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = categorySchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { name, image } = validation.data;

        // Generate unique slug
        let slug = slugify(name);
        const existingSlug = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
        if (existingSlug.rows.length > 0) {
            slug = generateUniqueSlug(name);
        }

        const result = await query<Category>(
            `INSERT INTO categories (name, slug, image) VALUES ($1, $2, $3) RETURNING *`,
            [name, slug, image || null]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create category',
        });
    }
};

// Admin: Update category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const validation = categorySchema.partial().safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const data = validation.data;
        const updates: string[] = [];
        const params: any[] = [];
        let paramCount = 0;

        if (data.name !== undefined) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            params.push(data.name);

            let slug = slugify(data.name);
            const existingSlug = await query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [slug, id]);
            if (existingSlug.rows.length > 0) {
                slug = generateUniqueSlug(data.name);
            }
            paramCount++;
            updates.push(`slug = $${paramCount}`);
            params.push(slug);
        }

        if (data.image !== undefined) {
            paramCount++;
            updates.push(`image = $${paramCount}`);
            params.push(data.image);
        }

        paramCount++;
        updates.push(`updated_at = NOW()`);
        params.push(id);

        const result = await query<Category>(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Category not found',
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update category',
        });
    }
};

// Admin: Delete category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Category not found',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete category',
        });
    }
};
