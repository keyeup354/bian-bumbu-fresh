import { Package, Tag, DollarSign, ShoppingBag } from 'lucide-react';
import { categories } from '@/data/products';

interface Product {
  id: string;
  is_flash_sale: boolean | null;
  stock: number;
}

interface AdminStatsProps {
  products: Product[];
  ordersCount: number;
}

const AdminStats = ({ products, ordersCount }: AdminStatsProps) => {
  return (
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
          <div className="bg-accent/10 rounded-full p-2">
            <Tag className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">{products.filter(p => p.is_flash_sale).length}</p>
            <p className="text-sm text-muted-foreground">Flash Sale</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{products.reduce((acc, p) => acc + (p.stock || 0), 0)}</p>
            <p className="text-sm text-muted-foreground">Total Stok</p>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{ordersCount}</p>
            <p className="text-sm text-muted-foreground">Pesanan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
