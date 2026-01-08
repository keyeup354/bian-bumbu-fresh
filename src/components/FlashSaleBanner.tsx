import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const FlashSaleBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Flash sale ends in 6 hours from now
    const endTime = new Date(Date.now() + 6 * 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-terracotta via-terracotta/90 to-terracotta animate-pulse-subtle">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2 animate-bounce">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <span className="font-display font-bold text-lg">⚡ FLASH SALE!</span>
              <span className="ml-2 text-white/90">Diskon hingga 30%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Berakhir dalam:</span>
              <div className="flex gap-1">
                <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="font-bold">:</span>
                <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">
                  {formatNumber(timeLeft.seconds)}
                </span>
              </div>
            </div>

            <Link to="/products?filter=flash-sale">
              <Button variant="secondary" size="sm" className="bg-white text-terracotta hover:bg-white/90">
                Lihat Promo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleBanner;
