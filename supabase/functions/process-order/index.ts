import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for order data
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface OrderData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  notes?: string;
}

// Sanitize string input to prevent XSS
function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove basic XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Validate phone number format (Indonesian format)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Validate order items
function validateItems(items: unknown): items is OrderItem[] {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return false;
  }
  
  return items.every(item => 
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.unit === 'string' &&
    item.price >= 0 &&
    item.price <= 100000000 && // Max 100 million IDR per item
    item.quantity >= 1 &&
    item.quantity <= 1000 &&
    item.name.length <= 200 &&
    item.unit.length <= 50
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.deliveryAddress || !body.items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize inputs
    const customerName = sanitizeString(body.customerName, 100);
    const customerPhone = sanitizeString(body.customerPhone, 20);
    const deliveryAddress = sanitizeString(body.deliveryAddress, 500);
    const notes = body.notes ? sanitizeString(body.notes, 500) : null;

    if (customerName.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Customer name must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidPhone(customerPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (deliveryAddress.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Delivery address must be at least 10 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validateItems(body.items)) {
      return new Response(
        JSON.stringify({ error: 'Invalid order items' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize items
    const sanitizedItems = body.items.map((item: OrderItem) => ({
      id: sanitizeString(item.id, 50),
      name: sanitizeString(item.name, 200),
      price: Math.max(0, Math.min(item.price, 100000000)),
      quantity: Math.max(1, Math.min(Math.floor(item.quantity), 1000)),
      unit: sanitizeString(item.unit, 50),
    }));

    // Calculate total
    const totalAmount = sanitizedItems.reduce(
      (sum: number, item: OrderItem) => sum + (item.price * item.quantity),
      0
    );

    // Create Supabase client with service role for inserting order
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: sanitizedItems,
        total_amount: totalAmount,
        notes: notes,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format date and time for webhook
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    const jam = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Format order text for webhook
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(price);
    };

    const pesananList = sanitizedItems.map((item: OrderItem) => 
      `${item.name} x${item.quantity} ${item.unit} = ${formatPrice(item.price * item.quantity)}`
    ).join('\n');
    
    const pesananText = `${pesananList}\n\nTotal: ${formatPrice(totalAmount)}`;

    // Send to webhook (optional - won't fail if webhook is down)
    const webhookUrl = Deno.env.get('WEBHOOK_URL');
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: customerName,
            alamat: deliveryAddress,
            telepon: customerPhone,
            pesanan: pesananText,
            tanggal: tanggal,
            jam: jam,
            order_id: order.id
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error (non-fatal):', webhookError);
        // Don't fail the order if webhook fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order submitted successfully',
        orderId: order.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process order' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
