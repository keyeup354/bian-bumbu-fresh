import { useState, useEffect } from 'react';
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
  media_urls: string[] | null;
  health_benefits: string | null;
  cooking_tips: string | null;
}

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);

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
          media_urls: editForm.media_urls || [],
          health_benefits: editForm.health_benefits || '',
          cooking_tips: editForm.cooking_tips || '',
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Gagal menambah produk: ' + error.message);
        return;
      }
      
      setProducts([data, ...products]);

      // Kirim juga ke n8n webhook add-produk
      try {
        const res = await fetch('https://n8n.arry.my.id/webhook/add-produk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            id: data.id,
            nama_produk: data.name,
            harga: data.price,
            foto_url: data.image_url,
            deskripsi: data.description,
          }),
        });
        console.log('n8n add-produk response:', res.status);
        if (!res.ok) {
          toast.warning('Produk tersimpan, tapi gagal sinkron ke n8n.');
        }
      } catch (webhookErr) {
        console.error('n8n add-produk error:', webhookErr);
        toast.warning('Produk tersimpan, tapi gagal sinkron ke n8n.');
      }

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
          media_urls: editForm.media_urls,
          health_benefits: editForm.health_benefits,
          cooking_tips: editForm.cooking_tips,
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
      media_urls: [],
      health_benefits: '',
      cooking_tips: '',
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
      <AdminHeader user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <AdminStats products={products} ordersCount={ordersCount} />

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

              {/* Add/Edit Form */}
              {(isAdding || isEditing) && (
                <ProductForm
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isAdding={isAdding}
                />
              )}

              {/* Product List */}
              {isLoadingProducts ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Memuat produk...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada produk. Klik "Tambah Produk" untuk memulai.</p>
                </div>
              ) : (
                <ProductTable
                  products={products}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
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
