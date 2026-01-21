import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthStore();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scale-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <span className="gradient-text">JualHP</span>
                    </Link>
                </div>

                <Card className="glass">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Selamat Datang</CardTitle>
                        <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail className="h-4 w-4" />}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        icon={<Lock className="h-4 w-4" />}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex-col gap-4">
                            <Button
                                type="submit"
                                variant="gradient"
                                className="w-full"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Memproses...' : 'Masuk'}
                            </Button>

                            <p className="text-sm text-muted-foreground">
                                Belum punya akun?{' '}
                                <Link to="/register" className="text-primary hover:underline font-medium">
                                    Daftar sekarang
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
