import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AddressGateProps {
  onSubmit: (address: string) => void;
}

const AddressGate = ({ onSubmit }: AddressGateProps) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      localStorage.setItem('userAddress', address);
      onSubmit(address);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-leaf-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            ButuhSayur
          </h1>
          <p className="text-white/80">Sayur & Bumbu Segar Berkualitas</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-2 rounded-full mb-4">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-sm">Area Bandung Only</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Masukkan Alamat Anda
            </h2>
            <p className="text-muted-foreground text-sm">
              Kami melayani pengiriman ke seluruh area Bandung dengan waktu antar 30 menit - 1 jam
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Masukkan alamat lengkap rumah Anda di Bandung..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-full" 
              size="lg"
              disabled={!address.trim()}
            >
              Lanjutkan Belanja
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>🚚</span>
                <span>30 menit - 1 jam</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>Bandung Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          Hubungi kami: +62 857-9378-4290
        </p>
      </div>
    </div>
  );
};

export default AddressGate;
