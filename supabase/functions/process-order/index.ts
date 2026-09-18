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

// Rate limiting configuration
const RATE_LIMIT_ENABLED = true;
const RATE_LIMIT_MAX_ORDERS = 2; // max 2 orders
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // per 1 hour

// Extract the client IP silently from proxy headers
function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
  return ip.slice(0, 64);
}

// Check rate limit per phone number AND per IP address
// deno-lint-ignore no-explicit-any
async function checkRateLimit(phone: string, ip: string, supabase: any): Promise<boolean> {
  if (!RATE_LIMIT_ENABLED) return true;

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const normalizedPhone = phone.replace(/[\s-]/g, '');

  const filters = [`customer_phone.eq.${normalizedPhone}`];
  if (ip) filters.push(`ip_address.eq.${ip}`);

  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_phone, ip_address')
    .gte('created_at', since)
    .or(filters.join(','));

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow the request if rate limit check fails
    return true;
  }

  const byPhone = (data || []).filter((o: { customer_phone: string }) => o.customer_phone === normalizedPhone).length;
  const byIp = ip ? (data || []).filter((o: { ip_address: string | null }) => o.ip_address === ip).length : 0;

  return byPhone < RATE_LIMIT_MAX_ORDERS && byIp < RATE_LIMIT_MAX_ORDERS;
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

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit - max 2 orders per phone number and per IP per hour
    const clientIp = getClientIp(req);
    const withinRateLimit = await checkRateLimit(customerPhone, clientIp, supabase);
    if (!withinRateLimit) {
      return new Response(
        JSON.stringify({ error: 'Terlalu banyak pesanan dari perangkat ini. Mohon tunggu 1 jam sebelum mencoba lagi untuk menghindari spam.' }),
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

    // Auto-decrement stock for items that exist in the products table.
    // Fire and forget per item; failure here doesn't fail the order.
    await Promise.all(
      stockDecrements.map(({ id, qty }) =>
        supabase.rpc('decrement_product_stock', { _id: id, _qty: qty })
          .then(({ error }) => { if (error) console.warn('decrement_product_stock failed', id, error); })
      )
    );



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
