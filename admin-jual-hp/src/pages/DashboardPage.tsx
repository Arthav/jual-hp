import { Package, ShoppingCart, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { adminUserService, type DashboardStats } from '@/services/admin.service';



export function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminUserService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!stats) {
        return <div className="p-6">Failed to load dashboard data</div>;
    }

    const statCards = [
        { title: 'Total Produk', value: stats.stats.totalProducts, icon: Package, change: 'Items', trend: 'neutral' },
        { title: 'Total Pesanan', value: stats.stats.totalOrders, icon: ShoppingCart, change: 'Orders', trend: 'neutral' },
        { title: 'Pengguna Aktif', value: stats.stats.totalUsers, icon: Users, change: 'Users', trend: 'neutral' },
        { title: 'Pendapatan', value: formatPrice(stats.stats.totalRevenue), icon: DollarSign, change: 'Total', trend: 'neutral' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Selamat datang di panel admin JualHP</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {stat.change}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan Terbaru</CardTitle>
                        <CardDescription>5 pesanan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada pesanan terbaru.</p>
                            ) : (
                                stats.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{order.customer}</p>
                                            <p className="text-sm text-muted-foreground">{order.product}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPrice(order.total)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-success/20 text-success' :
                                                order.status === 'processing' ? 'bg-primary/20 text-primary' :
                                                    order.status === 'pending' ? 'bg-warning/20 text-warning' :
                                                        'bg-destructive/10 text-destructive'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perhatian</CardTitle>
                        <CardDescription>Hal yang perlu diperhatikan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.alerts.lowStock > 0 && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-warning">Stok Rendah</p>
                                        <p className="text-sm text-muted-foreground">{stats.alerts.lowStock} produk memiliki stok kurang dari 10</p>
                                    </div>
                                </div>
                            )}
                            {stats.alerts.pendingOrders > 0 && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <ShoppingCart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-primary">Pesanan Baru</p>
                                        <p className="text-sm text-muted-foreground">{stats.alerts.pendingOrders} pesanan menunggu konfirmasi</p>
                                    </div>
                                </div>
                            )}
                            {stats.alerts.lowStock === 0 && stats.alerts.pendingOrders === 0 && (
                                <p className="text-sm text-muted-foreground">Tidak ada peringatan saat ini.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
