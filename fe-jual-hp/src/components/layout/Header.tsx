import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Smartphone, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const { user, isAuthenticated, logout } = useAuthStore();
    const { cart } = useCartStore();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-strong">
            <div className="container flex h-16 items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                        <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <span className="gradient-text hidden sm:block">JualHP</span>
                </Link>

                {/* Search - Desktop */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
                    <Input
                        placeholder="Cari smartphone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                        className="w-full"
                    />
                </form>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Cart */}
                    <Link to="/cart" className="relative">
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-5 w-5" />
                            {cart && cart.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-medium flex items-center justify-center text-primary-foreground">
                                    {cart.itemCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link to="/orders">
                                <Button variant="ghost" size="sm">
                                    Pesanan
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{user?.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Masuk</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="gradient" size="sm">Daftar</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-card animate-slide-down">
                    <div className="container py-4 space-y-4">
                        <form onSubmit={handleSearch}>
                            <Input
                                placeholder="Cari smartphone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </form>

                        <nav className="flex flex-col gap-2">
                            <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                    Semua Produk
                                </Button>
                            </Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                    Keranjang {cart && cart.itemCount > 0 && `(${cart.itemCount})`}
                                </Button>
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Pesanan Saya
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-destructive"
                                        onClick={handleLogout}
                                    >
                                        Keluar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Masuk
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="gradient" className="w-full">
                                            Daftar
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
