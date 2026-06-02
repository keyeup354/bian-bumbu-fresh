import { useRef } from 'react';
import { Save, X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/products';
import { toast } from 'sonner';

interface Variant {
  id: string;
  unit: string;
  price: number;
}

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
  variants: Variant[];
}

interface ProductFormProps {
  editForm: Partial<Product>;
  setEditForm: (form: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
  isAdding: boolean;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProductForm = ({ editForm, setEditForm, onSave, onCancel, isAdding }: ProductFormProps) => {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setEditForm({ ...editForm, image_url: dataUrl });
    } catch {
      toast.error('Gagal membaca file');
    } finally {
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  const handleMediaFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} tidak didukung`);
        continue;
      }
      const limit = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > limit) {
        toast.error(`File ${file.name} terlalu besar`);
        continue;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        newUrls.push(dataUrl);
      } catch {
        toast.error(`Gagal membaca ${file.name}`);
      }
    }
    if (newUrls.length > 0) {
      setEditForm({ ...editForm, media_urls: [...(editForm.media_urls || []), ...newUrls] });
      toast.success(`${newUrls.length} media ditambahkan`);
    }
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const removeMedia = (url: string) => {
    setEditForm({ ...editForm, media_urls: (editForm.media_urls || []).filter((u) => u !== url) });
  };

  const isVideo = (url: string) => /^data:video\//i.test(url) || /\.(mp4|webm|mov|avi|mkv)$/i.test(url);

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
          <Label>Gambar Utama</Label>
          <div className="flex gap-2 items-center">
            {editForm.image_url ? (
              <img src={editForm.image_url} alt="preview" className="w-10 h-10 rounded object-cover border border-border" />
            ) : null}
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageFile}
              className="block w-full text-sm text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
            />
          </div>
          <Input
            value={editForm.image_url || ''}
            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
            placeholder="Atau tempel URL gambar"
          />
        </div>
      </div>

      {/* In-stock toggle */}
      <div className="bg-card rounded-lg p-4 border border-border flex items-center gap-3">
        <Switch
          checked={editForm.in_stock !== false}
          onCheckedChange={(checked) => setEditForm({ ...editForm, in_stock: checked })}
        />
        <div>
          <Label className="text-base font-medium">
            {editForm.in_stock !== false ? 'In Stock' : 'Barang Habis'}
          </Label>
          <p className="text-xs text-muted-foreground">Atur ketersediaan produk untuk pembeli</p>
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

      {/* Media Upload (base64, local state) */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Foto / Video Tambahan</Label>
        <p className="text-sm text-muted-foreground">
          Disimpan sementara di perangkat (base64 / local URL).
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaFiles}
            className="hidden"
            id="product-media-input"
          />
          <Button type="button" variant="outline" onClick={() => mediaInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Pilih File
          </Button>
          <span className="text-xs text-muted-foreground">Gambar ≤5MB, Video ≤20MB</span>
        </div>
        {editForm.media_urls && editForm.media_urls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
            {editForm.media_urls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted">
                {isVideo(url) ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt={`media-${i}`} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(url)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-90 hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants (Multi-unit pricing) */}
      <div className="bg-card rounded-lg p-4 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Varian Ukuran & Harga</Label>
            <p className="text-xs text-muted-foreground">Tambahkan beberapa pilihan unit (mis. 500g, 1kg) dengan harga masing-masing. Jika diisi, pembeli memilih varian sebelum menambah ke keranjang.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newVariant = { id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, unit: '', price: 0 };
              setEditForm({ ...editForm, variants: [...(editForm.variants || []), newVariant] });
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Tambah Varian
          </Button>
        </div>
        {(editForm.variants || []).length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Belum ada varian. Harga utama di atas akan dipakai.</p>
        ) : (
          <div className="space-y-2">
            {(editForm.variants || []).map((v, idx) => (
              <div key={v.id || idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Unit (mis. 500 gram)"
                  value={v.unit}
                  onChange={(e) => {
                    const next = [...(editForm.variants || [])];
                    next[idx] = { ...next[idx], unit: e.target.value };
                    setEditForm({ ...editForm, variants: next });
                  }}
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  value={v.price || ''}
                  onChange={(e) => {
                    const next = [...(editForm.variants || [])];
                    next[idx] = { ...next[idx], price: Number(e.target.value) };
                    setEditForm({ ...editForm, variants: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => {
                    const next = (editForm.variants || []).filter((_, i) => i !== idx);
                    setEditForm({ ...editForm, variants: next });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Manfaat Kesehatan</Label>
        <Textarea
          value={editForm.health_benefits || ''}
          onChange={(e) => setEditForm({ ...editForm, health_benefits: e.target.value })}
          placeholder="Jelaskan manfaat kesehatan dari produk ini."
          rows={4}
        />
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
