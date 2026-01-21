import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Truck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export function OrdersPage() {
    const { isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (isAuthenticated) loadOrders();
    }, [isAuthenticated, page]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const response = await orderService.getMyOrders(page, 10);
            setOrders(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-4">Masuk untuk melihat pesanan</h2>
                <Link to="/login">
                    <Button variant="gradient">Masuk</Button>
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-8">
                <h1 className="text-2xl font-bold mb-8">Pesanan Saya</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="h-6 skeleton w-1/3 mb-2" />
                                <div className="h-4 skeleton w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-4">Belum ada pesanan</h2>
                <p className="text-muted-foreground mb-6">Mulai belanja untuk membuat pesanan pertama</p>
                <Link to="/products">
                    <Button variant="gradient">Lihat Produk</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-8">Pesanan Saya</h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;

                    return (
                        <Link key={order.id} to={`/orders/${order.id}`}>
                            <Card hover>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={status.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-lg font-bold gradient-text">
                                                {formatPrice(order.total)}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Sebelumnya
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Halaman {page} dari {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Selanjutnya
                    </Button>
                </div>
            )}
        </div>
    );
}
