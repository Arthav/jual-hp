import { Package, ShoppingCart, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

const stats = [
    { title: 'Total Produk', value: '124', icon: Package, change: '+12%', trend: 'up' },
    { title: 'Total Pesanan', value: '89', icon: ShoppingCart, change: '+8%', trend: 'up' },
    { title: 'Pengguna Aktif', value: '256', icon: Users, change: '+23%', trend: 'up' },
    { title: 'Pendapatan', value: formatPrice(45000000), icon: DollarSign, change: '+15%', trend: 'up' },
];

const recentOrders = [
    { id: '1', customer: 'John Doe', product: 'iPhone 15 Pro', total: 25000000, status: 'pending' },
    { id: '2', customer: 'Jane Smith', product: 'Samsung S24', total: 18000000, status: 'processing' },
    { id: '3', customer: 'Bob Wilson', product: 'Pixel 8 Pro', total: 15000000, status: 'delivered' },
];

export function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Selamat datang di panel admin JualHP</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center text-xs text-success">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {stat.change} dari bulan lalu
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
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{order.customer}</p>
                                        <p className="text-sm text-muted-foreground">{order.product}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatPrice(order.total)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-success/20 text-success' :
                                                order.status === 'processing' ? 'bg-primary/20 text-primary' :
                                                    'bg-warning/20 text-warning'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
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
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-warning">Stok Rendah</p>
                                    <p className="text-sm text-muted-foreground">5 produk memiliki stok kurang dari 10</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <ShoppingCart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-primary">Pesanan Baru</p>
                                    <p className="text-sm text-muted-foreground">3 pesanan menunggu konfirmasi</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
