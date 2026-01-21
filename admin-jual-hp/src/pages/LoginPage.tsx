import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

interface LoginPageProps {
    onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const { accessToken, refreshToken, user } = response.data.data;

                if (user.role !== 'admin') {
                    setError('Akses ditolak. Hanya admin yang dapat masuk.');
                    return;
                }

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                onLogin();
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-xl bg-primary w-fit">
                        <Smartphone className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <CardDescription>Masuk ke panel administrasi</CardDescription>
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
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@jualHP.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
