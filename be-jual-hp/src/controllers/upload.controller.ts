import { Request, Response } from 'express';

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({
                success: false,
                error: 'No files uploaded',
            });
            return;
        }

        const files = req.files as Express.Multer.File[];
        const urls = files.map((file) => `/uploads/${file.filename}`);

        res.json({
            success: true,
            data: urls,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload images',
        });
    }
};
