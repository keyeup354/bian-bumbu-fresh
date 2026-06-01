import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/AdminLogin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';
import OrdersPanel from '@/components/admin/OrdersPanel';
import { useProducts, AdminProduct } from '@/contexts/ProductsContext';
import { toast } from 'sonner';

export interface AdminFormProduct {
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
  in_stock: boolean;
  media_urls: string[] | null;
  health_benefits: string | null;
  cooking_tips: string | null;
}

const toForm = (p: AdminProduct): AdminFormProduct => ({
  id: p.id,
  name: p.name,
  price: p.price,
  unit: p.unit,
  image_url: p.image || null,
  category: p.category,
  description: p.description || null,
  is_flash_sale: p.isFlashSale || false,
  flash_sale_price: p.flashSalePrice ?? null,
  stock: p.stock ?? 0,
  in_stock: p.inStock !== false,
  media_urls: p.gallery || null,
  health_benefits: p.healthBenefits || null,
  cooking_tips: null,
});

const fromForm = (f: Partial<AdminFormProduct>, fallbackId?: string): AdminProduct => ({
  id: f.id || fallbackId || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: f.name || '',
  price: Number(f.price) || 0,
  unit: f.unit || 'per pack',
  image: f.image_url || '',
  category: f.category || 'vegetables',
  description: f.description || '',
  isFlashSale: f.is_flash_sale || false,
  flashSalePrice: f.flash_sale_price ?? undefined,
  stock: Number(f.stock) || 0,
  inStock: f.in_stock !== false,
  gallery: f.media_urls || [],
  healthBenefits: f.health_benefits || '',
});

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, setInStock } = useProducts();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminFormProduct>>({});
  const [ordersCount, setOrdersCount] = useState(0);

  const handleEdit = (product: AdminFormProduct) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const handleSave = () => {
    if (!editForm.name) {
      toast.error('Nama produk wajib diisi');
      return;
    }
    if (isAdding) {
      addProduct(fromForm(editForm));
      toast.success('Produk berhasil ditambahkan');
      setIsAdding(false);
    } else if (isEditing) {
      updateProduct(isEditing, fromForm(editForm, isEditing));
      toast.success('Produk berhasil diperbarui');
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
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
      id: '',
      name: '',
      price: 0,
      unit: 'per pack',
      image_url: '',
      category: 'vegetables',
      description: '',
      is_flash_sale: false,
      stock: 100,
      in_stock: true,
      media_urls: [],
      health_benefits: '',
      cooking_tips: '',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Berhasil keluar');
  };

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

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const formProducts = products.map(toForm);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <AdminStats products={formProducts} ordersCount={ordersCount} />

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              Pesanan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display text-xl font-bold">Kelola Produk</h2>
                <Button onClick={startAdding} disabled={isAdding || isEditing !== null}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk
                </Button>
              </div>

              {(isAdding || isEditing) && (
                <ProductForm
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isAdding={isAdding}
                />
              )}

              {formProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada produk. Klik "Tambah Produk" untuk memulai.</p>
                </div>
              ) : (
                <ProductTable
                  products={formProducts}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStock={(id, val) => setInStock(id, val)}
                  isEditing={isEditing !== null || isAdding}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel onOrdersCountChange={setOrdersCount} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
