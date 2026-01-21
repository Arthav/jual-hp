import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-card border-t border-border mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                                <Smartphone className="h-5 w-5 text-white" />
                            </div>
                            <span className="gradient-text">JualHP</span>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            Toko smartphone terpercaya dengan produk berkualitas dan harga terbaik.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Menu</h4>
                        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link to="/products" className="hover:text-primary transition-colors">Semua Produk</Link>
                            <Link to="/products?category=smartphone" className="hover:text-primary transition-colors">Smartphone</Link>
                            <Link to="/products?category=tablet" className="hover:text-primary transition-colors">Tablet</Link>
                            <Link to="/products?category=accessories" className="hover:text-primary transition-colors">Aksesoris</Link>
                        </nav>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Layanan</h4>
                        <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link to="/orders" className="hover:text-primary transition-colors">Lacak Pesanan</Link>
                            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
                            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
                            <a href="#" className="hover:text-primary transition-colors">FAQ</a>
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Hubungi Kami</h4>
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>support@jualHP.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>+62 812 3456 7890</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>Jakarta, Indonesia</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} JualHP. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
