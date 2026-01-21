import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productService } from '@/services/product.service';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import type { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

export function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (slug) loadProduct(slug);
    }, [slug]);

    const loadProduct = async (productSlug: string) => {
        setIsLoading(true);
        try {
            const data = await productService.getProductBySlug(productSlug);
            setProduct(data);
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product || !isAuthenticated) return;

        setIsAdding(true);
        try {
            await addToCart(product.id, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="aspect-square skeleton rounded-xl" />
                    <div className="space-y-4">
                        <div className="h-8 skeleton w-3/4" />
                        <div className="h-6 skeleton w-1/2" />
                        <div className="h-24 skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-xl font-semibold mb-4">Produk tidak ditemukan</h2>
                <Link to="/products">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Produk
                    </Button>
                </Link>
            </div>
        );
    }

    const specs = product.specifications || {};

    return (
        <div className="container py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-primary">Produk</Link>
                <span>/</span>
                <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-xl bg-card border border-border overflow-hidden">
                        {product.images[selectedImage] ? (
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </div>

                    {product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={cn(
                                        'w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-colors',
                                        selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                                    )}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    {product.category_name && (
                        <Badge variant="outline">{product.category_name}</Badge>
                    )}

                    <h1 className="text-3xl font-bold">{product.name}</h1>

                    <p className="text-4xl font-bold gradient-text">{formatPrice(product.price)}</p>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                            <>
                                <Check className="h-5 w-5 text-success" />
                                <span className="text-success font-medium">Stok tersedia</span>
                                {product.stock <= 10 && (
                                    <span className="text-warning text-sm">(Tinggal {product.stock})</span>
                                )}
                            </>
                        ) : (
                            <span className="text-destructive font-medium">Stok habis</span>
                        )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    {product.stock > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {isAuthenticated ? (
                                <Button
                                    variant="gradient"
                                    size="lg"
                                    className="flex-1"
                                    onClick={handleAddToCart}
                                    disabled={isAdding || added}
                                >
                                    {added ? (
                                        <>
                                            <Check className="mr-2 h-5 w-5" />
                                            Ditambahkan!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Link to="/login" className="flex-1">
                                    <Button variant="gradient" size="lg" className="w-full">
                                        Masuk untuk Membeli
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                            <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
                            <p className="text-xs text-muted-foreground">Gratis Ongkir</p>
                        </div>
                        <div className="text-center">
                            <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                            <p className="text-xs text-muted-foreground">Garansi Resmi</p>
                        </div>
                        <div className="text-center">
                            <RotateCcw className="h-6 w-6 mx-auto text-primary mb-2" />
                            <p className="text-xs text-muted-foreground">7 Hari Retur</p>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="pt-4 border-t border-border">
                            <h3 className="font-semibold mb-2">Deskripsi</h3>
                            <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {/* Specifications */}
                    {Object.keys(specs).length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3">Spesifikasi</h3>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(specs).map(([key, value]) => (
                                        <div key={key} className="contents">
                                            <dt className="text-muted-foreground">{key}</dt>
                                            <dd className="font-medium">{String(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
