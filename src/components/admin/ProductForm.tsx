import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/products';
import MediaUploader from './MediaUploader';

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

interface ProductFormProps {
  editForm: Partial<Product>;
  setEditForm: (form: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
  isAdding: boolean;
}

const ProductForm = ({ editForm, setEditForm, onSave, onCancel, isAdding }: ProductFormProps) => {
  return (
    <div className="p-6 bg-muted/50 border-b border-border space-y-6">
      <h3 className="font-display text-lg font-semibold">
        {isAdding ? 'Tambah Produk Baru' : 'Edit Produk'}
      </h3>
      
      {/* Basic Info */}
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
          <Label>URL Gambar Utama</Label>
          <Input
            value={editForm.image_url || ''}
            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
            placeholder="URL gambar produk"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Deskripsi Produk</Label>
        <Textarea
          value={editForm.description || ''}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          placeholder="Deskripsi singkat produk"
          rows={3}
        />
      </div>

      {/* Flash Sale Settings */}
      <div className="bg-card rounded-lg p-4 border border-border space-y-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={editForm.is_flash_sale || false}
            onCheckedChange={(checked) => setEditForm({ ...editForm, is_flash_sale: checked })}
          />
          <Label className="text-base font-medium">Aktifkan Flash Sale</Label>
        </div>
        {editForm.is_flash_sale && (
          <div className="space-y-2 ml-12">
            <Label>Harga Flash Sale (Rp)</Label>
            <Input
              type="number"
              value={editForm.flash_sale_price || ''}
              onChange={(e) => setEditForm({ ...editForm, flash_sale_price: Number(e.target.value) })}
              placeholder="Harga promo"
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Media Upload */}
      {editForm.id && (
        <div className="space-y-2">
          <Label className="text-base font-medium">Media Produk (Foto & Video)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Upload foto dan video produk. Media ini akan ditampilkan di halaman detail produk.
          </p>
          <MediaUploader
            productId={editForm.id}
            mediaUrls={editForm.media_urls || []}
            onMediaChange={(urls) => setEditForm({ ...editForm, media_urls: urls })}
          />
        </div>
      )}

      {/* Educational Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-base font-medium">Manfaat Kesehatan</Label>
          <Textarea
            value={editForm.health_benefits || ''}
            onChange={(e) => setEditForm({ ...editForm, health_benefits: e.target.value })}
            placeholder="Jelaskan manfaat kesehatan dari produk ini. Pisahkan poin dengan baris baru."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Contoh: Kaya vitamin C, Baik untuk pencernaan, Meningkatkan imunitas
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">Tips Memasak</Label>
          <Textarea
            value={editForm.cooking_tips || ''}
            onChange={(e) => setEditForm({ ...editForm, cooking_tips: e.target.value })}
            placeholder="Berikan tips memasak atau penggunaan produk ini."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Contoh: Tumis dengan bawang putih, Cocok untuk sup, Simpan di kulkas
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Simpan
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
