import { Edit2, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  media_urls: string[] | null;
  health_benefits: string | null;
  cooking_tips: string | null;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

const ProductTable = ({ products, onEdit, onDelete, isEditing }: ProductTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getMediaCount = (urls: string[] | null) => {
    if (!urls) return { images: 0, videos: 0 };
    const images = urls.filter(url => !url.match(/\.(mp4|webm|mov|avi|mkv)$/i)).length;
    const videos = urls.filter(url => url.match(/\.(mp4|webm|mov|avi|mkv)$/i)).length;
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
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const mediaCount = getMediaCount(product.media_urls);
            return (
              <TableRow key={product.id}>
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
                  {product.is_flash_sale ? (
                    <Badge className="bg-accent text-accent-foreground">Flash Sale</Badge>
                  ) : (
                    <Badge variant="outline">Normal</Badge>
                  )}
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
