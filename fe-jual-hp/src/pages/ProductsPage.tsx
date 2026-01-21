import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SortAsc, Grid3X3, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productService, categoryService } from '@/services/product.service';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';

export function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [page, category, search, sortBy, sortOrder]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await productService.getProducts({
                page,
                limit: 12,
                category: category || undefined,
                search: search || undefined,
                sortBy,
                sortOrder,
            });
            setProducts(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const updateParams = (updates: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        if (updates.category !== undefined || updates.search !== undefined) {
            newParams.set('page', '1');
        }
        setSearchParams(newParams);
    };

    return (
        <div className="container py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="lg:w-64 shrink-0">
                    <Card className="sticky top-20">
                        <CardContent className="p-4 space-y-6">
                            {/* Search */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Search className="h-4 w-4" /> Cari
                                </h3>
                                <Input
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => updateParams({ search: e.target.value })}
                                />
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Kategori
                                </h3>
                                <div className="space-y-1">
                                    <Button
                                        variant={!category ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => updateParams({ category: '' })}
                                    >
                                        Semua Kategori
                                    </Button>
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.id}
                                            variant={category === cat.slug ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="w-full justify-between"
                                            onClick={() => updateParams({ category: cat.slug })}
                                        >
                                            {cat.name}
                                            {cat.product_count !== undefined && (
                                                <Badge variant="outline" className="ml-2">
                                                    {cat.product_count}
                                                </Badge>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <SortAsc className="h-4 w-4" /> Urutkan
                                </h3>
                                <div className="space-y-1">
                                    {[
                                        { value: 'created_at', label: 'Terbaru' },
                                        { value: 'price', label: 'Harga' },
                                        { value: 'name', label: 'Nama' },
                                    ].map((option) => (
                                        <Button
                                            key={option.value}
                                            variant={sortBy === option.value ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => updateParams({
                                                sortBy: option.value,
                                                sortOrder: sortBy === option.value && sortOrder === 'desc' ? 'asc' : 'desc'
                                            })}
                                        >
                                            {option.label}
                                            {sortBy === option.value && (
                                                <span className="ml-auto text-xs text-muted-foreground">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid */}
                <main className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">
                            {category ? categories.find(c => c.slug === category)?.name : 'Semua Produk'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <div className="aspect-square skeleton" />
                                    <CardContent className="p-4 space-y-2">
                                        <div className="h-5 skeleton w-3/4" />
                                        <div className="h-4 skeleton w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
                        </Card>
                    ) : (
                        <>
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                {products.map((product) => (
                                    <Link key={product.id} to={`/products/${product.slug}`}>
                                        <Card hover className={`overflow-hidden h-full ${viewMode === 'list' ? 'flex' : ''}`}>
                                            <div className={`${viewMode === 'list' ? 'w-48 shrink-0' : ''} aspect-square bg-muted relative overflow-hidden`}>
                                                {product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                                {product.stock === 0 && (
                                                    <Badge variant="destructive" className="absolute top-2 right-2">
                                                        Habis
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardContent className="p-4 space-y-2 flex-1">
                                                {product.category_name && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {product.category_name}
                                                    </Badge>
                                                )}
                                                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                                                <p className="text-lg font-bold gradient-text">{formatPrice(product.price)}</p>
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <p className="text-xs text-warning">Stok tinggal {product.stock}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        disabled={page <= 1}
                                        onClick={() => updateParams({ page: String(page - 1) })}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <Button
                                                key={i + 1}
                                                variant={page === i + 1 ? 'default' : 'outline'}
                                                size="icon"
                                                onClick={() => updateParams({ page: String(i + 1) })}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        disabled={page >= totalPages}
                                        onClick={() => updateParams({ page: String(page + 1) })}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
