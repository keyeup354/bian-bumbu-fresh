import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Tag, DollarSign, Image, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { products as initialProducts, categories, ExtendedProduct } from '@/data/products';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>(initialProducts);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ExtendedProduct>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEdit = (product: ExtendedProduct) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const handleSave = () => {
    if (isAdding) {
      const newProduct: ExtendedProduct = {
        id: `new-${Date.now()}`,
        name: editForm.name || '',
        price: editForm.price || 0,
        unit: editForm.unit || 'per pack',
        image: editForm.image || '',
        category: editForm.category || 'vegetables',
        description: editForm.description || '',
        isFlashSale: editForm.isFlashSale || false,
        flashSalePrice: editForm.flashSalePrice,
        stock: editForm.stock || 100,
      };
      setProducts([...products, newProduct]);
      setIsAdding(false);
    } else if (isEditing) {
      setProducts(products.map(p => 
        p.id === isEditing ? { ...p, ...editForm } : p
      ));
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
    setEditForm({});
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditForm({
      name: '',
      price: 0,
      unit: 'per pack',
      image: '',
      category: 'vegetables',
      description: '',
      isFlashSale: false,
      stock: 100,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <span className="font-display text-xl font-bold text-primary">Admin Dashboard</span>
            </Link>
            <Link to="/">
              <Button variant="outline">Kembali ke Toko</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Produk</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-terracotta/10 rounded-full p-2">
                <Tag className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.isFlashSale).length}</p>
                <p className="text-sm text-muted-foreground">Flash Sale</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-golden/10 rounded-full p-2">
                <Image className="w-5 h-5 text-golden" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.reduce((acc, p) => acc + (p.stock || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Stok</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Management */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display text-xl font-bold">Kelola Produk</h2>
            <Button onClick={startAdding} disabled={isAdding || isEditing !== null}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>

          {/* Add/Edit Form */}
          {(isAdding || isEditing) && (
            <div className="p-4 bg-muted/50 border-b border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nama Produk</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nama produk"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga (Rp)</Label>
                  <Input
                    type="number"
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    placeholder="Harga"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={editForm.unit || ''}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    placeholder="per kg, per ikat, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    value={editForm.stock || ''}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    placeholder="Jumlah stok"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Gambar</Label>
                  <Input
                    value={editForm.image || ''}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    placeholder="URL gambar produk"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Deskripsi produk"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editForm.isFlashSale || false}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isFlashSale: checked })}
                    />
                    <Label>Flash Sale</Label>
                  </div>
                  {editForm.isFlashSale && (
                    <div className="space-y-2">
                      <Label>Harga Flash Sale</Label>
                      <Input
                        type="number"
                        value={editForm.flashSalePrice || ''}
                        onChange={(e) => setEditForm({ ...editForm, flashSalePrice: Number(e.target.value) })}
                        placeholder="Harga promo"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Product List */}
          <div className="divide-y divide-border">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    {product.isFlashSale && (
                      <Badge className="bg-terracotta text-white">Flash Sale</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                  {product.isFlashSale && product.flashSalePrice && (
                    <p className="text-sm text-terracotta">{formatPrice(product.flashSalePrice)}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{product.stock}</p>
                  <p className="text-xs text-muted-foreground">stok</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    disabled={isEditing !== null || isAdding}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                    disabled={isEditing !== null || isAdding}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          💡 Tip: Untuk menyimpan perubahan secara permanen, hubungkan ke database Lovable Cloud
        </p>
      </main>
    </div>
  );
};

export default Admin;
