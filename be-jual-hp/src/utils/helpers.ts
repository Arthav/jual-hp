export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = (text: string): string => {
    const baseSlug = slugify(text);
    const uniqueSuffix = Date.now().toString(36);
    return `${baseSlug}-${uniqueSuffix}`;
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

export const parseDecimal = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return parseFloat(value);
};
