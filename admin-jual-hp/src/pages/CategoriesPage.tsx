import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminCategoryService, type Category } from '@/services/admin.service';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await adminCategoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEditingCategory(null);
        setIsFormOpen(false);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await adminCategoryService.updateCategory(editingCategory.id, { name });
            } else {
                await adminCategoryService.createCategory({ name });
            }
            resetForm();
            loadCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;
        try {
            await adminCategoryService.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Kategori</h1>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kategori
                </Button>
            </div>

            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-4">
                            <Input
                                placeholder="Nama Kategori"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="flex-1"
                            />
                            <Button type="submit">{editingCategory ? 'Update' : 'Simpan'}</Button>
                            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-left text-sm text-muted-foreground">
                                <th className="p-4">Nama</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Jumlah Produk</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td className="p-4"><div className="h-5 skeleton w-24" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-20" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-12" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-16" /></td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada kategori</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="border-b border-border hover:bg-muted/50">
                                        <td className="p-4 font-medium">{cat.name}</td>
                                        <td className="p-4 text-muted-foreground">{cat.slug}</td>
                                        <td className="p-4">{cat.product_count ?? 0}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
