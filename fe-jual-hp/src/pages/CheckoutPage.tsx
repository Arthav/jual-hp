import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { orderService } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';

export function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        notes: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const order = await orderService.createOrder({
                shipping_address: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code,
                },
                notes: formData.notes || undefined,
            });

            await clearCart();
            navigate(`/orders/${order.id}`, { state: { success: true } });
        } catch (err: any) {
            setError(err.message || 'Gagal membuat pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-xl font-semibold mb-4">Silakan login terlebih dahulu</h2>
                <Link to="/login">
                    <Button variant="gradient">Masuk</Button>
                </Link>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-xl font-semibold mb-4">Keranjang kosong</h2>
                <Link to="/products">
                    <Button variant="gradient">Lihat Produk</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <Link to="/cart" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Keranjang
            </Link>

            <h1 className="text-2xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                {error}
                            </div>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Alamat Pengiriman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Penerima</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Alamat Lengkap</Label>
                                    <Input
                                        id="address"
                                        placeholder="Jalan, nomor rumah, RT/RW"
                                        value={formData.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Kota</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => updateField('city', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Provinsi</Label>
                                        <Input
                                            id="province"
                                            value={formData.province}
                                            onChange={(e) => updateField('province', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Kode Pos</Label>
                                        <Input
                                            id="postal_code"
                                            value={formData.postal_code}
                                            onChange={(e) => updateField('postal_code', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Catatan (opsional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Catatan untuk kurir"
                                        value={formData.notes}
                                        onChange={(e) => updateField('notes', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Metode Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-muted text-center text-muted-foreground">
                                    <p>COD (Cash on Delivery)</p>
                                    <p className="text-sm">Bayar saat barang diterima</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {item.product_name} x{item.quantity}
                                        </span>
                                        <span>{formatPrice(item.product_price * item.quantity)}</span>
                                    </div>
                                ))}

                                <div className="border-t border-border pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatPrice(cart.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Truck className="h-4 w-4" />
                                            Ongkir
                                        </span>
                                        <span className="text-success">Gratis</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="gradient-text">{formatPrice(cart.subtotal)}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
