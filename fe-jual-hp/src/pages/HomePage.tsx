import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Shield, Truck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
    {
        icon: Smartphone,
        title: 'Produk Original',
        description: 'Semua smartphone dijamin 100% original dan bergaransi resmi',
    },
    {
        icon: Shield,
        title: 'Garansi Terjamin',
        description: 'Garansi resmi hingga 1 tahun untuk semua produk',
    },
    {
        icon: Truck,
        title: 'Pengiriman Cepat',
        description: 'Gratis ongkir ke seluruh Indonesia untuk pembelian tertentu',
    },
    {
        icon: CreditCard,
        title: 'Pembayaran Aman',
        description: 'Berbagai metode pembayaran yang aman dan terpercaya',
    },
];

export function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                <div className="container relative py-32 lg:py-48">
                    <div className="max-w-2xl mx-auto text-center space-y-8 animate-slide-up mt-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                            Promo Spesial Minggu Ini
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mb-6">
                            Temukan <span className="text-accent relative inline-block">
                                Smartphone
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                </svg>
                            </span> Impian Anda
                        </h1>

                        <p className="text-xl text-white/90 max-w-xl mx-auto mb-8 leading-relaxed">
                            Koleksi smartphone terlengkap dari berbagai brand ternama dengan harga terbaik dan garansi resmi
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8 mb-5">
                            <Link to="/products">
                                <Button size="xl" className="group bg-white text-blue-600 hover:bg-white/90 border-0 font-bold px-8 shadow-lg shadow-blue-900/20">
                                    Lihat Produk
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link to="/products?category=promo">
                                <Button variant="outline" size="xl" className="text-white border-white hover:bg-white/10 hover:text-white">
                                    Promo Hari Ini
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            </section>

            {/* Features */}
            <section className="py-16 bg-background">
                <div className="container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
                <div className="container relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Siap Menemukan Smartphone Terbaik?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Jelajahi koleksi lengkap kami dan temukan penawaran terbaik untuk Anda
                        </p>
                        <Link to="/products">
                            <Button variant="gradient" size="lg" className="text-black">
                                Mulai Belanja Sekarang
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
