import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Package, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

interface OrdersPanelProps {
  onOrdersCountChange: (count: number) => void;
}

const OrdersPanel = ({ onOrdersCountChange }: OrdersPanelProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat pesanan');
    } else {
      // Parse items JSON for each order
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      setOrders(parsedOrders);
      onOrdersCountChange(parsedOrders.length);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Realtime: refresh when orders change
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const prev = orders;
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to update status:', error);
      toast.error('Gagal memperbarui status');
      setOrders(prev);
    } else {
      toast.success('Status pesanan diperbarui');
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'processing':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Pesanan Terbaru</h2>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orders.map((order) => (
            <div key={order.id} className="hover:bg-muted/50 transition-colors">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{order.customer_name}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusLabel(order.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">{order.items.length} item</p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 space-y-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Alamat Pengiriman</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                    {order.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Catatan</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Detail Pesanan</p>
                    <div className="bg-background rounded-lg border border-border divide-y divide-border">
                      {order.items.map((item, index) => (
                        <div key={index} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{item.quantity}x {formatPrice(item.price)}</p>
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPanel;
