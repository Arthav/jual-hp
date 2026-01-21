import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    LogOut,
    Smartphone,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Produk' },
    { path: '/categories', icon: FolderTree, label: 'Kategori' },
    { path: '/orders', icon: ShoppingCart, label: 'Pesanan' },
    { path: '/users', icon: Users, label: 'Pengguna' },
];

interface SidebarProps {
    onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside className={cn(
            'h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary">
                        <Smartphone className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!collapsed && <span className="font-bold text-lg">Admin</span>}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-3',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full justify-start gap-3 text-destructive hover:text-destructive',
                        collapsed && 'justify-center px-2'
                    )}
                    onClick={onLogout}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Keluar</span>}
                </Button>
            </div>
        </aside>
    );
}
