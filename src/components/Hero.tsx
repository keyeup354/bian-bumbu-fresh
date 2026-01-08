import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-leaf-light/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="text-xl">🌱</span>
            <span className="text-primary-foreground text-sm font-medium">
              Segar Setiap Hari
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Sayur & Bumbu
            <br />
            <span className="text-terracotta-light">Segar Berkualitas</span>
          </h1>

          {/* Description */}
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Belanja kebutuhan dapur dari rumah. Sayuran segar, bumbu lengkap, 
            dan bahan makanan berkualitas langsung diantar ke pintu rumah Anda.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="relative max-w-xl mx-auto mb-8 animate-slide-up" 
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center bg-primary-foreground rounded-full shadow-elevated p-2">
              <div className="flex items-center flex-1 px-4">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  placeholder="Cari sayur, bumbu, atau bahan lainnya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                />
              </div>
              <Button type="submit" variant="hero" className="rounded-full">
                Cari
              </Button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {['Sayuran', 'Bumbu', 'Tahu & Tempe', 'Bawang'].map((cat) => (
              <button
                key={cat}
                onClick={() => navigate('/products')}
                className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-foreground/20 transition-all hover:scale-105"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
