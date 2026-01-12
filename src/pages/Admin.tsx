import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Tag, DollarSign, Image, Save, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/products';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  category: string;
  description: string | null;
  is_flash_sale: boolean | null;
  flash_sale_price: number | null;
  stock: number;
}

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Gagal memuat produk');
      } else {
        setProducts(data || []);
      }
      setIsLoadingProducts(false);
    };

    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const handleSave = async () => {
    if (isAdding) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: editForm.name || '',
          price: editForm.price || 0,
          unit: editForm.unit || 'per pack',
          image_url: editForm.image_url || '',
          category: editForm.category || 'vegetables',
          description: editForm.description || '',
          is_flash_sale: editForm.is_flash_sale || false,
          flash_sale_price: editForm.flash_sale_price,
          stock: editForm.stock || 100,
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Gagal menambah produk: ' + error.message);
        return;
      }
      
      setProducts([data, ...products]);
      toast.success('Produk berhasil ditambahkan');
      setIsAdding(false);
    } else if (isEditing) {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          price: editForm.price,
          unit: editForm.unit,
          image_url: editForm.image_url,
          category: editForm.category,
          description: editForm.description,
          is_flash_sale: editForm.is_flash_sale,
          flash_sale_price: editForm.flash_sale_price,
          stock: editForm.stock,
        })
        .eq('id', isEditing);
      
      if (error) {
        toast.error('Gagal memperbarui produk: ' + error.message);
        return;
      }
      
      setProducts(products.map(p => 
        p.id === isEditing ? { ...p, ...editForm } as Product : p
      ));
      toast.success('Produk berhasil diperbarui');
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Gagal menghapus produk: ' + error.message);
        return;
      }
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produk berhasil dihapus');
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
      image_url: '',
      category: 'vegetables',
      description: '',
      is_flash_sale: false,
      stock: 100,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Link to="/">
                <Button variant="outline" size="sm">Kembali ke Toko</Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
                <p className="text-2xl font-bold">{products.filter(p => p.is_flash_sale).length}</p>
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
                    value={editForm.image_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
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
                      checked={editForm.is_flash_sale || false}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, is_flash_sale: checked })}
                    />
                    <Label>Flash Sale</Label>
                  </div>
                  {editForm.is_flash_sale && (
                    <div className="space-y-2">
                      <Label>Harga Flash Sale</Label>
                      <Input
                        type="number"
                        value={editForm.flash_sale_price || ''}
                        onChange={(e) => setEditForm({ ...editForm, flash_sale_price: Number(e.target.value) })}
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
          {isLoadingProducts ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Belum ada produk. Klik "Tambah Produk" untuk memulai.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.is_flash_sale && (
                        <Badge className="bg-terracotta text-white">Flash Sale</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                    {product.is_flash_sale && product.flash_sale_price && (
                      <p className="text-sm text-terracotta">{formatPrice(product.flash_sale_price)}</p>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
