import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
}

interface OrderData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  notes?: string;
  paymentMethod?: string;
}

// Sanitize string inputs to prevent XSS and injection attacks
function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Validate phone number format (Indonesian format)
function isValidPhone(phone: string): boolean {
  // Allow Indonesian phone formats: 08xx, +628xx, 628xx
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Validate order items structure
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
    item.quantity > 0 &&
    item.quantity <= 1000 &&
    item.price >= 0 &&
    item.price <= 100000000
  );
}

// Rate limiting configuration (DISABLED FOR TESTING)
const RATE_LIMIT_ENABLED = false; // Set to true to enable rate limiting
const RATE_LIMIT_MAX_ORDERS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Check rate limit for phone number
// deno-lint-ignore no-explicit-any
async function checkRateLimit(phone: string, supabase: any): Promise<boolean> {
  // Rate limiting disabled for testing
  if (!RATE_LIMIT_ENABLED) {
    console.log('Rate limiting is DISABLED for testing');
    return true;
  }
  
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  // Normalize phone number for consistent matching
  const normalizedPhone = phone.replace(/[\s-]/g, '');
  
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_phone', normalizedPhone)
    .gte('created_at', oneHourAgo);
  
  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow the request if rate limit check fails
    return true;
  }
  
  return !data || data.length < RATE_LIMIT_MAX_ORDERS;
}

// Webhook URL for n8n webhook (production)
const WEBHOOK_URL = 'https://n8n.arry.my.id/webhook/Bian-bumbus';

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

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit - limit to 5 orders per phone number per hour
    const withinRateLimit = await checkRateLimit(customerPhone, supabase);
    if (!withinRateLimit) {
      return new Response(
        JSON.stringify({ error: 'Too many orders. Please wait before placing another order.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up products by id (preferred) and name (fallback for legacy clients)
    const productIds = body.items
      .map((item: OrderItem) => sanitizeString(String(item.id || ''), 100))
      .filter((id: string) => id.length > 0);
    const productNames = body.items.map((item: OrderItem) => sanitizeString(item.name, 200));

    const [{ data: byId, error: byIdErr }, { data: byName, error: byNameErr }] = await Promise.all([
      productIds.length
        ? supabase.from('products').select('id, name, price, is_flash_sale, flash_sale_price, stock, unit, variants').in('id', productIds)
        : Promise.resolve({ data: [], error: null } as { data: never[]; error: null }),
      supabase.from('products').select('id, name, price, is_flash_sale, flash_sale_price, stock, unit, variants').in('name', productNames),
    ]);
    if (byIdErr) console.warn('Product id lookup failed:', byIdErr);
    if (byNameErr) console.warn('Product name lookup failed:', byNameErr);

    const productById = new Map((byId || []).map((p) => [p.id, p]));
    const productByName = new Map((byName || []).map((p) => [p.name, p]));

    const validatedItems: OrderItem[] = [];
    const stockDecrements: { id: string; qty: number }[] = [];

    for (const item of body.items) {
      const itemName = sanitizeString(item.name, 200);
      const itemId = sanitizeString(String(item.id || ''), 100);
      const product = productById.get(itemId) || productByName.get(itemName);
      const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 1000));

      if (product) {
        if (product.stock < quantity) {
          return new Response(
            JSON.stringify({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Resolve price: variant > flash sale > regular
        let serverPrice = product.is_flash_sale && product.flash_sale_price
          ? Number(product.flash_sale_price)
          : Number(product.price);
        let serverUnit = product.unit || item.unit;
        const variants = Array.isArray(product.variants) ? product.variants : [];
        // Client may send composite id "productId::variantId" via item.id; or unit hints variant
        const variantIdHint = itemId.includes('::') ? itemId.split('::')[1] : '';
        const matchedVariant = variants.find((v: { id: string; unit: string; price: number }) =>
          (variantIdHint && v.id === variantIdHint) || (item.unit && v.unit === item.unit)
        );
        if (matchedVariant) {
          serverPrice = Number(matchedVariant.price);
          serverUnit = matchedVariant.unit;
        }
        validatedItems.push({
          id: product.id,
          name: product.name,
          price: serverPrice,
          quantity,
          unit: serverUnit,
        });
        stockDecrements.push({ id: product.id, qty: quantity });
      } else {
        const price = Math.max(0, Math.min(Number(item.price) || 0, 100000000));
        validatedItems.push({
          id: itemId || itemName,
          name: itemName,
          price,
          quantity,
          unit: item.unit ? sanitizeString(item.unit, 20) : 'pcs',
        });
      }
    }

    // Calculate total using validated server prices
    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Insert order into database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: validatedItems,
        total_amount: totalAmount,
        notes: notes,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format helper for currency
    const formatRupiah = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Format order items for webhook with product details and total
    const pesananLines = validatedItems.map(item => {
      const subtotal = item.price * item.quantity;
      return `${item.name} x${item.quantity} (${item.unit || 'pcs'}) @ ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}`;
    });
    // Add total at the bottom
    pesananLines.push(`---`);
    pesananLines.push(`TOTAL: ${formatRupiah(totalAmount)}`);
    const pesananText = pesananLines.join('\n');

    // Get current date and time in Indonesia timezone (YYYY-MM-DD HH:mm:ss)
    const now = new Date();
    const indonesiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const year = indonesiaTime.getFullYear();
    const month = String(indonesiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(indonesiaTime.getDate()).padStart(2, '0');
    const hours = String(indonesiaTime.getHours()).padStart(2, '0');
    const minutes = String(indonesiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(indonesiaTime.getSeconds()).padStart(2, '0');
    const waktu = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Get payment method from request (default to 'COD' if not provided)
    const paymentMethod = body.paymentMethod ? sanitizeString(body.paymentMethod, 50) : 'COD';

    // Build single-line order summary: 'Bayam Hijau (2), Sawi Putih (1)'
    const pesanan = validatedItems
      .map(item => `${item.name} (${item.quantity})`)
      .join(', ');

    // Send data to webhook (n8n) with the requested simple shape
    const webhookPayload = {
      waktu,
      nama: customerName,
      pesanan,
      alamat: deliveryAddress,
      method_bayar: paymentMethod,
    };

    console.log('=== GOOGLE SHEETS WEBHOOK DEBUG ===');
    console.log('URL:', WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
        redirect: 'follow',
      });

      const responseBody = await webhookResponse.text();
      console.log('Google Sheets response status:', webhookResponse.status, webhookResponse.statusText);
      console.log('Google Sheets response body:', responseBody);

      if (!webhookResponse.ok) {
        console.error('Google Sheets webhook failed:', webhookResponse.status, responseBody);
      } else {
        console.log('Google Sheets webhook sent successfully!');
      }
    } catch (webhookError) {
      console.error('Google Sheets webhook error:', webhookError instanceof Error ? webhookError.message : String(webhookError));
      // Don't fail the order if webhook fails - order is already saved in DB
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
    console.error('Order processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
