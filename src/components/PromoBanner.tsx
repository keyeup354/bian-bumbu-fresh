import { Gift, Truck, Tag } from 'lucide-react';
import { promotions } from '@/data/products';

const iconMap: { [key: string]: React.ReactNode } = {
  promo1: <Tag className="w-6 h-6" />,
  promo2: <Truck className="w-6 h-6" />,
  promo3: <Gift className="w-6 h-6" />,
};

const colorMap: { [key: string]: string } = {
  promo1: 'from-primary to-primary/80',
  promo2: 'from-terracotta to-terracotta/80',
  promo3: 'from-golden to-golden/80',
};

const PromoBanner = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promotions.filter(p => p.isActive).map((promo) => (
            <div
              key={promo.id}
              className={`bg-gradient-to-r ${colorMap[promo.id] || 'from-primary to-primary/80'} rounded-2xl p-6 text-white transform hover:scale-[1.02] transition-transform cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  {iconMap[promo.id] || <Gift className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">{promo.title}</h3>
                  <p className="text-white/90 text-sm">{promo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
