import { useState, useEffect } from 'react';
import { Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { adminUserService, type User } from '@/services/admin.service';

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await adminUserService.getUsers(page, 20);
            setUsers(response.data);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, role: string) => {
        if (role === 'admin') {
            alert('Cannot delete admin user');
            return;
        }
        if (!confirm('Yakin ingin menghapus pengguna ini?')) return;
        try {
            await adminUserService.deleteUser(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Pengguna</h1>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari pengguna..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-left text-sm text-muted-foreground">
                                <th className="p-4">Nama</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Terdaftar</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td className="p-4"><div className="h-5 skeleton w-32" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-48" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-16" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-24" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-8" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        Tidak ada pengguna
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                        <td className="p-4 font-medium">{user.name}</td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4">
                                            {user.role !== 'admin' && (
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id, user.role)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Pagination */}
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
