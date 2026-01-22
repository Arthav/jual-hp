import { useState, useEffect } from 'react';
import { Clock, Package, Truck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminOrderService, type Order } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';

const statusOptions = [
    { value: 'pending', label: 'Menunggu', icon: Clock, color: 'bg-warning/20 text-warning' },
    { value: 'processing', label: 'Diproses', icon: Package, color: 'bg-primary/20 text-primary' },
    { value: 'shipped', label: 'Dikirim', icon: Truck, color: 'bg-accent/20 text-accent' },
    { value: 'delivered', label: 'Selesai', icon: Check, color: 'bg-success/20 text-success' },
    { value: 'cancelled', label: 'Batal', icon: X, color: 'bg-destructive/20 text-destructive' },
];

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        loadOrders();
    }, [page, filterStatus]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const response = await adminOrderService.getOrders(page, 20, filterStatus || undefined);
            setOrders(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        try {
            await adminOrderService.updateOrderStatus(orderId, newStatus);
            loadOrders();
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const getStatusConfig = (status: string) => statusOptions.find((s) => s.value === status) || statusOptions[0];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Pesanan</h1>
                <select
                    className="h-9 rounded-md border border-input bg-background px-3"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                >
                    <option value="" className="bg-black text-white">Semua Status</option>
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-left text-sm text-muted-foreground">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Pelanggan</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td className="p-4"><div className="h-5 skeleton w-20" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-32" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-24" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-20" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-28" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-24" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada pesanan</td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const status = getStatusConfig(order.status);
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                                            <td className="p-4">
                                                <div>{order.user_name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{order.user_email}</div>
                                            </td>
                                            <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${status.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                                            <td className="p-4">
                                                <select
                                                    className="h-8 text-xs rounded border border-input bg-background px-2"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                >
                                                    {statusOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        Sebelumnya
                    </Button>
                    <span className="flex items-center px-4 text-sm">Halaman {page} / {totalPages}</span>
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        Selanjutnya
                    </Button>
                </div>
            )}
        </div>
    );
}
