import { Edit2, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  in_stock: boolean;
  media_urls: string[] | null;
  health_benefits: string | null;
  cooking_tips: string | null;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStock: (id: string, inStock: boolean) => void;
  isEditing: boolean;
}

const ProductTable = ({ products, onEdit, onDelete, onToggleStock, isEditing }: ProductTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getMediaCount = (urls: string[] | null) => {
    if (!urls) return { images: 0, videos: 0 };
    const videos = urls.filter((url) => /^data:video\//i.test(url) || url.match(/\.(mp4|webm|mov|avi|mkv)$/i)).length;
    const images = urls.length - videos;
    return { images, videos };
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Foto</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Stok</TableHead>
            <TableHead className="text-center">Media</TableHead>
            <TableHead className="text-center">Ketersediaan</TableHead>
            <TableHead className="w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const mediaCount = getMediaCount(product.media_urls);
            return (
              <TableRow key={product.id} className={product.in_stock === false ? 'opacity-60' : ''}>
                <TableCell>
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.unit}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <p className="font-medium text-primary">{formatPrice(product.price)}</p>
                    {product.is_flash_sale && product.flash_sale_price && (
                      <p className="text-sm text-accent">{formatPrice(product.flash_sale_price)}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${product.stock < 10 ? 'text-destructive' : ''}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {mediaCount.images > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ImageIcon className="w-3 h-3" />
                        {mediaCount.images}
                      </span>
                    )}
                    {mediaCount.videos > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Video className="w-3 h-3" />
                        {mediaCount.videos}
                      </span>
                    )}
                    {mediaCount.images === 0 && mediaCount.videos === 0 && (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Switch
                      checked={product.in_stock !== false}
                      onCheckedChange={(checked) => onToggleStock(product.id, checked)}
                    />
                    <span className={`text-xs ${product.in_stock === false ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {product.in_stock === false ? 'Barang Habis' : 'In Stock'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      disabled={isEditing}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(product.id)}
                      disabled={isEditing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
