import { useState } from 'react';
import { MapPin, User, Phone, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DeliveryFormData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface DeliveryAddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryFormData) => void;
}

const DeliveryAddressForm = ({ isOpen, onClose, onSubmit }: DeliveryAddressFormProps) => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<DeliveryFormData>>({});

  const validateForm = () => {
    const newErrors: Partial<DeliveryFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    } else if (formData.address.length < 20) {
      newErrors.address = 'Alamat terlalu singkat, mohon lengkapi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof DeliveryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">Alamat Pengiriman</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nama Lengkap
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Nomor Telepon/WhatsApp
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Alamat Lengkap
              </Label>
              <Textarea
                id="address"
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className={`min-h-[100px] ${errors.address ? 'border-destructive' : ''}`}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Catatan (Opsional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Patokan lokasi, warna rumah, dll."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <Button type="submit" variant="cart" className="w-full" size="lg">
              Lanjutkan ke Checkout
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DeliveryAddressForm;
