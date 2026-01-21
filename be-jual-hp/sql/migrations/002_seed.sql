-- Migration: 002_seed.sql
-- Description: Seed data for Users, Categories, and Products

-- Insert Categories
INSERT INTO categories (name, slug, image) VALUES
('Smartphones', 'smartphones', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80'),
('Tablets', 'tablets', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80'),
('Accessories', 'accessories', 'https://images.unsplash.com/photo-1631281907711-665b16f316b0?w=500&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Get Category IDs (using a CTE to make it robust)
WITH cat_ids AS (
    SELECT id, slug FROM categories
)
INSERT INTO products (name, slug, description, price, stock, images, category_id, specifications, is_active)
VALUES
-- Smartphones
(
    'iPhone 15 Pro',
    'iphone-15-pro',
    'iPhone 15 Pro. Forged in titanium. Featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
    20999000,
    50,
    ARRAY['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'],
    (SELECT id FROM cat_ids WHERE slug = 'smartphones'),
    '{"screen": "6.1 inch", "ram": "8GB", "storage": "256GB"}'::jsonb,
    true
),
(
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra',
    'Galaxy S24 Ultra. The ultimate Galaxy with AI. Titanium frame, S Pen included, and the best camera system yet.',
    21999000,
    45,
    ARRAY['https://images.unsplash.com/photo-1706718182962-d98c255d6174?w=800&q=80', 'https://images.unsplash.com/photo-1706692984532-6a84000302b1?w=800&q=80'],
    (SELECT id FROM cat_ids WHERE slug = 'smartphones'),
    '{"screen": "6.8 inch", "ram": "12GB", "storage": "512GB"}'::jsonb,
    true
),
(
    'Google Pixel 8 Pro',
    'google-pixel-8-pro',
    'Pixel 8 Pro. The all-pro phone engineered by Google. It has the most advanced Pixel cameras yet and Google machine learning.',
    16999000,
    30,
    ARRAY['https://images.unsplash.com/photo-1696639641427-b64931e06915?w=800&q=80'],
    (SELECT id FROM cat_ids WHERE slug = 'smartphones'),
    '{"screen": "6.7 inch", "ram": "12GB", "storage": "128GB"}'::jsonb,
    true
),
(
    'Xiaomi 14',
    'xiaomi-14',
    'Xiaomi 14 with Leica optics. Compact size, massive performance with Snapdragon 8 Gen 3.',
    12999000,
    40,
    ARRAY['https://images.unsplash.com/photo-1709744720935-865604ec2820?w=800&q=80'],
    (SELECT id FROM cat_ids WHERE slug = 'smartphones'),
    '{"screen": "6.36 inch", "ram": "12GB", "storage": "256GB"}'::jsonb,
    true
),

-- Tablets
(
    'iPad Pro 13 M4',
    'ipad-pro-13-m4',
    'The new iPad Pro. Impossibly thin. Incredibly powerful with the M4 chip.',
    24999000,
    20,
    ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'], -- Placeholder image
    (SELECT id FROM cat_ids WHERE slug = 'tablets'),
    '{"screen": "13 inch", "processor": "M4", "storage": "256GB"}'::jsonb,
    true
),

-- Accessories
(
    'AirPods Pro (2nd Gen)',
    'airpods-pro-2',
    'Up to 2x more Active Noise Cancellation. Transparency mode. Personalized Spatial Audio. And a more capable MagSafe Charging Case.',
    3999000,
    100,
    ARRAY['https://images.unsplash.com/photo-1691436152864-42d45c829e5e?w=800&q=80'],
    (SELECT id FROM cat_ids WHERE slug = 'accessories'),
    '{"type": "TWS", "battery": "6 hours"}'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;
