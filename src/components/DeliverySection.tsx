import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DeliverySection = () => {
  const handleWhatsAppCall = () => {
    const phoneNumber = '6285793874290';
    const message = encodeURIComponent('Halo, saya ingin memesan sayuran segar dari Bian Bumbu. Bisa dibantu?');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-terracotta/5">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Phone className="w-4 h-4" />
              <span className="font-medium text-sm">Layanan Antar</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Kesusahan untuk keluar rumah dan membeli?
              <span className="text-primary block mt-2">Panggil saja kami! 📞</span>
            </h2>
            
            <p className="text-muted-foreground text-lg">
              Tidak perlu repot keluar rumah. Cukup pesan via WhatsApp, kami antarkan ke depan pintu rumah Anda dengan cepat dan aman.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="bg-primary/10 rounded-full p-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">30 Menit - 1 Jam</p>
                  <p className="text-sm text-muted-foreground">Pengiriman cepat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="bg-primary/10 rounded-full p-2">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bandung Only</p>
                  <p className="text-sm text-muted-foreground">Area pengiriman</p>
                </div>
              </div>
            </div>

            <Button 
              variant="whatsapp" 
              size="xl" 
              className="rounded-full"
              onClick={handleWhatsAppCall}
            >
              <MessageCircle className="w-5 h-5" />
              Pesan Sekarang via WhatsApp
            </Button>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-terracotta/20 rounded-3xl p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="text-8xl">🛵</div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-foreground">Layanan Antar Cepat</h3>
                  <p className="text-muted-foreground">Sayuran segar langsung ke rumah Anda</p>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <span className="text-3xl">🥬</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <span className="text-3xl">🌶️</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <span className="text-3xl">🧅</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-golden/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
