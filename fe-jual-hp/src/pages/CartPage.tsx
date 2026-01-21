import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    if (!isAuthenticated) {
        return (
            <div className="container py-16">
                <Card className="max-w-md mx-auto text-center p-8">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Masuk untuk melihat keranjang</h2>
                    <p className="text-muted-foreground mb-6">
                        Silakan masuk ke akun Anda untuk mengakses keranjang belanja
                    </p>
                    <Link to="/login">
                        <Button variant="gradient">Masuk</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4 flex gap-4">
                                    <div className="w-24 h-24 skeleton rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 skeleton w-3/4" />
                                        <div className="h-4 skeleton w-1/2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-16">
                <Card className="max-w-md mx-auto text-center p-8">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Keranjang kosong</h2>
                    <p className="text-muted-foreground mb-6">
                        Belum ada produk di keranjang Anda. Mulai belanja sekarang!
                    </p>
                    <Link to="/products">
                        <Button variant="gradient">Lihat Produk</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="p-4 flex gap-4">
                                {/* Product Image */}
                                <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                                    {item.product_image ? (
                                        <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{item.product_name}</h3>
                                    <p className="text-lg font-bold gradient-text mt-1">
                                        {formatPrice(item.product_price)}
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product_stock}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Subtotal</p>
                                    <p className="font-semibold">
                                        {formatPrice(item.product_price * item.quantity)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Ringkasan Pesanan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal ({cart.itemCount} item)</span>
                                <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ongkir</span>
                                <span className="text-sm text-muted-foreground">Dihitung saat checkout</span>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="gradient-text">{formatPrice(cart.subtotal)}</span>
                                </div>
                            </div>
                            <Button
                                variant="gradient"
                                size="lg"
                                className="w-full"
                                onClick={() => navigate('/checkout')}
                            >
                                Checkout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Link to="/products" className="block">
                                <Button variant="outline" className="w-full">
                                    Lanjut Belanja
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
