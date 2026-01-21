import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminProductService, adminCategoryService, type Product, type Category } from '@/services/admin.service';
import { formatPrice } from '@/lib/utils';

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        is_active: true,
    });

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                adminProductService.getProducts(page, 20),
                adminCategoryService.getCategories(),
            ]);
            setProducts(productsRes.data);
            setTotalPages(productsRes.pagination.totalPages);
            setCategories(categoriesRes);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', stock: '', category_id: '', is_active: true });
        setEditingProduct(null);
        setIsFormOpen(false);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stock: String(product.stock),
            category_id: product.category_id || '',
            is_active: product.is_active,
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: formData.category_id || null,
                is_active: formData.is_active,
            };

            if (editingProduct) {
                await adminProductService.updateProduct(editingProduct.id, data);
            } else {
                await adminProductService.createProduct(data);
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await adminProductService.deleteProduct(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Produk</h1>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                </Button>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Nama Produk"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <select
                                    className="h-9 rounded-md border border-input bg-background px-3"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                placeholder="Deskripsi"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    placeholder="Harga"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Stok"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">{editingProduct ? 'Update' : 'Simpan'}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
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
                                <th className="p-4">Produk</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4">Stok</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-border">
                                        <td className="p-4"><div className="h-5 skeleton w-32" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-20" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-24" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-12" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-16" /></td>
                                        <td className="p-4"><div className="h-5 skeleton w-20" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        Tidak ada produk
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                                        <td className="p-4 font-medium">{product.name}</td>
                                        <td className="p-4 text-muted-foreground">{product.category_name || '-'}</td>
                                        <td className="p-4">{formatPrice(product.price)}</td>
                                        <td className="p-4">{product.stock}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${product.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
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
