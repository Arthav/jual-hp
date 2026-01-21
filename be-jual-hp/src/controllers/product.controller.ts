import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database.js';
import { Product, ProductWithCategory } from '../types/index.js';
import { slugify, generateUniqueSlug } from '../utils/helpers.js';

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    images: z.array(z.string()).optional(),
    category_id: z.string().uuid().optional().nullable(),
    specifications: z.record(z.any()).optional(),
    is_active: z.boolean().optional(),
});

const updateProductSchema = productSchema.partial();

// Public: Get all products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const offset = (page - 1) * limit;
        const category = req.query.category as string;
        const search = req.query.search as string;
        const minPrice = parseFloat(req.query.minPrice as string) || 0;
        const maxPrice = parseFloat(req.query.maxPrice as string) || Number.MAX_VALUE;
        const sortBy = req.query.sortBy as string || 'created_at';
        const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

        let whereClause = 'WHERE p.is_active = true';
        const params: any[] = [];
        let paramCount = 0;

        if (category) {
            paramCount++;
            whereClause += ` AND c.slug = $${paramCount}`;
            params.push(category);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        paramCount++;
        whereClause += ` AND p.price >= $${paramCount}`;
        params.push(minPrice);

        paramCount++;
        whereClause += ` AND p.price <= $${paramCount}`;
        params.push(maxPrice);

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].total);

        // Valid sort columns
        const validSortColumns = ['created_at', 'price', 'name', 'stock'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

        // Get products
        const result = await query<ProductWithCategory>(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.${sortColumn} ${sortOrder}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
            [...params, limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get products',
        });
    }
};

// Public: Get product by slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const result = await query<ProductWithCategory>(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
            [slug]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get product',
        });
    }
};

// Admin: Get all products (including inactive)
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const countResult = await query('SELECT COUNT(*) as total FROM products');
        const total = parseInt(countResult.rows[0].total);

        const result = await query<ProductWithCategory>(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get products',
        });
    }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = productSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const { name, description, price, stock, images, category_id, specifications, is_active } = validation.data;

        // Generate unique slug
        let slug = slugify(name);
        const existingSlug = await query('SELECT id FROM products WHERE slug = $1', [slug]);
        if (existingSlug.rows.length > 0) {
            slug = generateUniqueSlug(name);
        }

        const result = await query<Product>(
            `INSERT INTO products (name, slug, description, price, stock, images, category_id, specifications, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                name,
                slug,
                description || null,
                price,
                stock || 0,
                images || [],
                category_id || null,
                JSON.stringify(specifications || {}),
                is_active !== false,
            ]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product',
        });
    }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const validation = updateProductSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: validation.error.errors[0].message,
            });
            return;
        }

        const data = validation.data;

        // Check if product exists
        const existing = await query<Product>('SELECT * FROM products WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        // Build update query dynamically
        const updates: string[] = [];
        const params: any[] = [];
        let paramCount = 0;

        if (data.name !== undefined) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            params.push(data.name);

            // Update slug if name changed
            let slug = slugify(data.name);
            const existingSlug = await query('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
            if (existingSlug.rows.length > 0) {
                slug = generateUniqueSlug(data.name);
            }
            paramCount++;
            updates.push(`slug = $${paramCount}`);
            params.push(slug);
        }

        if (data.description !== undefined) {
            paramCount++;
            updates.push(`description = $${paramCount}`);
            params.push(data.description);
        }

        if (data.price !== undefined) {
            paramCount++;
            updates.push(`price = $${paramCount}`);
            params.push(data.price);
        }

        if (data.stock !== undefined) {
            paramCount++;
            updates.push(`stock = $${paramCount}`);
            params.push(data.stock);
        }

        if (data.images !== undefined) {
            paramCount++;
            updates.push(`images = $${paramCount}`);
            params.push(data.images);
        }

        if (data.category_id !== undefined) {
            paramCount++;
            updates.push(`category_id = $${paramCount}`);
            params.push(data.category_id);
        }

        if (data.specifications !== undefined) {
            paramCount++;
            updates.push(`specifications = $${paramCount}`);
            params.push(JSON.stringify(data.specifications));
        }

        if (data.is_active !== undefined) {
            paramCount++;
            updates.push(`is_active = $${paramCount}`);
            params.push(data.is_active);
        }

        paramCount++;
        updates.push(`updated_at = NOW()`);
        params.push(id);

        const result = await query<Product>(
            `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product',
        });
    }
};

// Admin: Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product',
        });
    }
};
