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

// Webhook URL for Make.com custom webhook
const WEBHOOK_URL = 'https://hook.us2.make.com/u22jvkbbispk8mr2efjteedpm14gi9n7';

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

    // Extract product names from order items (using name since client uses local non-UUID IDs)
    const productNames = body.items.map((item: OrderItem) => sanitizeString(item.name, 200));

    // Fetch actual prices from database to prevent price manipulation
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, is_flash_sale, flash_sale_price, stock, unit')
      .in('name', productNames);

    if (productsError || !products) {
      console.error('Failed to fetch products:', productsError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a lookup map for products by name
    const productMap = new Map(products.map(p => [p.name, p]));

    // Validate all products exist and build validated items with SERVER prices
    const validatedItems: OrderItem[] = [];
    for (const item of body.items) {
      const itemName = sanitizeString(item.name, 200);
      const product = productMap.get(itemName);
      
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${itemName}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 1000));

      // Check stock availability
      if (product.stock < quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${itemName}. Available: ${product.stock}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use SERVER-SIDE price, not client-provided price
      const serverPrice = product.is_flash_sale && product.flash_sale_price 
        ? product.flash_sale_price 
        : product.price;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: serverPrice,
        quantity: quantity,
        unit: product.unit || item.unit,
      });
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

    // Get current date and time in Indonesia timezone (DD-MM-YYYY HH:mm format)
    const now = new Date();
    const indonesiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const day = String(indonesiaTime.getDate()).padStart(2, '0');
    const month = String(indonesiaTime.getMonth() + 1).padStart(2, '0');
    const year = indonesiaTime.getFullYear();
    const hours = String(indonesiaTime.getHours()).padStart(2, '0');
    const minutes = String(indonesiaTime.getMinutes()).padStart(2, '0');
    const waktu = `${day}-${month}-${year} ${hours}:${minutes}`;

    // Get payment method from request (default to 'COD' if not provided)
    const paymentMethod = body.paymentMethod ? sanitizeString(body.paymentMethod, 50) : 'COD';

    // Send data to n8n webhook
    const webhookPayload = {
      customer_info: {
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress,
      },
      items: validatedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      total_amount: totalAmount,
      payment_method: paymentMethod,
      order_time: waktu,
      notes: notes || '',
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
