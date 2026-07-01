import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type PaymentMethod = 'COD' | 'E-Wallet' | 'TF';

const CartSlideout = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Get saved address from localStorage
  const savedAddress = localStorage.getItem('userAddress') || '';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Phone validation (Indonesian format)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const handleSubmitOrder = async () => {
    // Client-side validation
    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();

    if (trimmedName.length < 2) {
      toast.error('Nama minimal 2 karakter');
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      toast.error('Format nomor HP tidak valid. Contoh: 08123456789');
      return;
    }

    if (!savedAddress || savedAddress.length < 10) {
      toast.error('Alamat pengiriman tidak valid');
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to edge function for server-side validation and processing
      const { data, error } = await supabase.functions.invoke('process-order', {
        body: {
          customerName: trimmedName,
          customerPhone: trimmedPhone,
          deliveryAddress: savedAddress,
          paymentMethod: paymentMethod,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      });

      if (error) {
        console.error('Order submission error:', error);
        toast.error('Gagal mengirim pesanan. Silakan coba lagi.');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Order saved & stock decremented server-side by the process-order edge function.

      // Fire-and-forget webhook notification to n8n
      try {
        const pesananStr = items
          .map((it) => `${it.name} (${it.unit}) x${it.quantity}`)
          .join(', ');
        await fetch(
          'https://n8n.arry.my.id/webhook/0c192261-7e1c-4609-9183-90c4016aa95f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama: trimmedName,
              pesanan: pesananStr,
              total: totalPrice,
              alamat: savedAddress,
              metode_pembayaran: paymentMethod,
            }),
          }
        );
      } catch (webhookError) {
        console.log('Webhook notification failed:', webhookError);
      }

      toast.success('Pesanan berhasil dikirim! Kami akan segera menghubungi Anda.');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('COD');
      setIsCartOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Gagal mengirim pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slideout Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-elevated animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold">Keranjang Belanja</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Keranjang Kosong</h3>
              <p className="text-muted-foreground text-sm">
                Yuk, mulai belanja kebutuhan dapur Anda!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card rounded-xl p-3 border border-border"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                    <p className="font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 bg-muted rounded-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Form */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Customer Form */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Nama</Label>
                <Input
                  id="customerName"
                  placeholder="Masukkan nama Anda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">No. HP</Label>
                <Input
                  id="customerPhone"
                  placeholder="Contoh: 08123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
              {savedAddress && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                  <span className="font-medium">Alamat:</span> {savedAddress}
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  className="flex flex-col gap-2"
                >
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="COD" id="cod" />
                    <div>
                      <span className="font-medium text-foreground">Cash on Delivery</span>
                      <p className="text-xs text-muted-foreground">Bayar saat barang diterima</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="E-Wallet" id="ewallet" />
                    <div>
                      <span className="font-medium text-foreground">E-Wallet</span>
                      <p className="text-xs text-muted-foreground">GoPay, OVO, DANA, dll</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="TF" id="transfer" />
                    <div>
                      <span className="font-medium text-foreground">Transfer Bank</span>
                      <p className="text-xs text-muted-foreground">BCA, BRI, Mandiri, dll</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-lg pt-2 border-t border-border">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display font-bold text-xl text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Submit Order Button */}
            <Button
              size="xl"
              className="w-full rounded-xl"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim Pesanan...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Pesanan
                </>
              )}
            </Button>

            {/* Clear Cart */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={clearCart}
              disabled={isSubmitting}
            >
              Kosongkan Keranjang
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSlideout;
