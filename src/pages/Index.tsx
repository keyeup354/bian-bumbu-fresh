import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import CartSlideout from '@/components/CartSlideout';
import Footer from '@/components/Footer';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import PromoBanner from '@/components/PromoBanner';
import DeliverySection from '@/components/DeliverySection';
import { categories, featuredProducts } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {


  return (
    <div className="min-h-screen bg-background">
      <FlashSaleBanner />
      <Header />
      <CartSlideout />

      <main>
        <Hero />
        <PromoBanner />

        {/* Categories Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Kategori Produk
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Temukan berbagai kebutuhan dapur Anda dengan mudah
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Delivery CTA Section */}
        <DeliverySection />

        {/* Featured Products Section */}
        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Produk Unggulan
                </h2>
                <p className="text-muted-foreground">Pilihan terbaik untuk masakan Anda</p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="group">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat produk...
              </div>
            ) : error ? (
              <div className="text-center text-muted-foreground py-16">
                Gagal memuat produk dari server.
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">Belum ada produk.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: '🥬', title: 'Selalu Segar', desc: 'Dipetik setiap hari' },
                { icon: '🚚', title: 'Antar Cepat', desc: '30 menit - 1 jam' },
                { icon: '💯', title: 'Kualitas Terjamin', desc: 'Bahan pilihan terbaik' },
                { icon: '💬', title: 'Mudah Dipesan', desc: 'Via WhatsApp langsung' },
              ].map((item) => (
                <div key={item.title} className="p-4">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h4 className="font-display font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
