import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

export function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, name);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
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
                        <CardTitle className="text-2xl">Buat Akun</CardTitle>
                        <CardDescription>Daftar untuk mulai berbelanja</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    icon={<User className="h-4 w-4" />}
                                    required
                                />
                            </div>

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
                                        placeholder="Minimal 6 karakter"
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

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Ulangi password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    icon={<Lock className="h-4 w-4" />}
                                    required
                                />
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
                                {isLoading ? 'Memproses...' : 'Daftar'}
                            </Button>

                            <p className="text-sm text-muted-foreground">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Masuk
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
