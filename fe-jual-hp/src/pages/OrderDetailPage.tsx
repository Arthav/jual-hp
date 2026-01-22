import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, Truck, Check, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { orderService } from '@/services/product.service';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

const statusConfig = {
    pending: { label: 'Menunggu', icon: Clock, color: 'bg-warning/20 text-warning' },
    processing: { label: 'Diproses', icon: Package, color: 'bg-primary/20 text-primary' },
    shipped: { label: 'Dikirim', icon: Truck, color: 'bg-accent/20 text-accent' },
    delivered: { label: 'Selesai', icon: Check, color: 'bg-success/20 text-success' },
    cancelled: { label: 'Dibatalkan', icon: X, color: 'bg-destructive/20 text-destructive' },
};

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuthStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && id) loadOrderDetail();
    }, [isAuthenticated, id]);

    const loadOrderDetail = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await orderService.getOrderDetail(id);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order:', error);
            setError('Gagal memuat detail pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="container py-8 text-center">Memuat...</div>;
    }

    if (error || !order) {
        return (
            <div className="container py-8 text-center">
                <p className="text-destructive mb-4">{error || 'Pesanan tidak ditemukan'}</p>
                <Link to="/orders">
                    <Button variant="outline">Kembali ke Pesanan Saya</Button>
                </Link>
            </div>
        );
    }

    const status = statusConfig[order.status];
    const StatusIcon = status.icon;
    const shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;

    return (
        <div className="container py-8 max-w-4xl">
            <Link to="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Pesanan Saya
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-muted-foreground">
                        Dipesan pada {formatDate(order.created_at)}
                    </p>
                </div>
                <Badge className={`${status.color} text-sm py-1 px-3`}>
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {status.label}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Produk</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-start py-4 border-b last:border-0 last:pb-0 first:pt-0">
                                    <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                                <span>Total</span>
                                <span className="gradient-text">{formatPrice(order.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Info Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Metode Pembayaran</p>
                                <p>{order.payment_method || '-'}</p>
                            </div>
                            {order.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Catatan</p>
                                    <p>{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {shippingAddress && (
                                <>
                                    <div>
                                        <p className="font-semibold">{shippingAddress.name}</p>
                                        <p className="text-sm">{shippingAddress.phone}</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{shippingAddress.address}</p>
                                        <p>{shippingAddress.city}, {shippingAddress.province}</p>
                                        <p>{shippingAddress.postal_code}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
