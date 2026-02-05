 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface CartItem {
   productId: number;
   productName: string;
   productBrand: string;
   productImageUrl: string;
   quantity: number;
   unitPrice: number;
   subtotal: number;
 }
 
 interface CreateOrderRequest {
   items: CartItem[];
   subtotal: number;
   deliveryFee: number;
   totalAmount: number;
   paymentMethod: "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "CASH_ON_DELIVERY";
   deliveryFirstName: string;
   deliveryLastName: string;
   deliveryPhone: string;
   deliveryAddress: string;
   deliveryCity: string;
   deliveryRegion?: string;
   deliveryNotes?: string;
 }
 
 // Generate order number
 function generateOrderNumber(): string {
   const date = new Date();
   const year = date.getFullYear().toString().slice(-2);
   const month = (date.getMonth() + 1).toString().padStart(2, "0");
   const day = date.getDate().toString().padStart(2, "0");
   const random = Math.random().toString(36).substring(2, 8).toUpperCase();
   return `BT${year}${month}${day}-${random}`;
 }
 
 // Send order confirmation SMS
 async function sendOrderConfirmationSms(
   supabaseUrl: string,
   phone: string,
   orderNumber: string,
   customerName: string,
   totalAmount: number,
   paymentMethod: string
 ): Promise<void> {
   const paymentMethodNames: Record<string, string> = {
     WAVE: "Wave",
     ORANGE_MONEY: "Orange Money",
     FREE_MONEY: "Free Money",
     CASH_ON_DELIVERY: "Paiement à la livraison",
   };
 
   const formattedAmount = new Intl.NumberFormat("fr-SN", {
     style: "currency",
     currency: "XOF",
     minimumFractionDigits: 0,
   }).format(totalAmount);
 
   const message = `🛒 BichriTech - Commande Confirmée!\n\nBonjour ${customerName},\n\nVotre commande ${orderNumber} de ${formattedAmount} a été reçue.\n\n💳 Paiement: ${paymentMethodNames[paymentMethod] || paymentMethod}\n\nMerci pour votre confiance!\n📞 Support: 77 123 45 67`;
 
   try {
     const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
       },
       body: JSON.stringify({
         to: phone,
         message: message,
         orderNumber: orderNumber,
       }),
     });
 
     const result = await response.json();
     console.log("SMS notification result:", result);
   } catch (error) {
     console.error("Failed to send SMS notification:", error);
     // Don't fail the order if SMS fails
   }
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     
     // Get user from auth header
     const authHeader = req.headers.get("Authorization");
     const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
     
     let userId: string | null = null;
     
     if (authHeader) {
       const token = authHeader.replace("Bearer ", "");
       const { data: { user } } = await supabaseClient.auth.getUser(token);
       userId = user?.id || null;
     }
 
     const orderRequest: CreateOrderRequest = await req.json();
     
     console.log("Creating order for user:", userId || "guest");
 
     // Generate order number
     const orderNumber = generateOrderNumber();
 
     // Create the order
     const { data: order, error: orderError } = await supabaseClient
       .from("orders")
       .insert({
         user_id: userId,
         order_number: orderNumber,
         status: "PENDING",
         payment_method: orderRequest.paymentMethod,
         payment_status: "PENDING",
         subtotal: orderRequest.subtotal,
         delivery_fee: orderRequest.deliveryFee,
         total_amount: orderRequest.totalAmount,
         delivery_first_name: orderRequest.deliveryFirstName,
         delivery_last_name: orderRequest.deliveryLastName,
         delivery_phone: orderRequest.deliveryPhone,
         delivery_address: orderRequest.deliveryAddress,
         delivery_city: orderRequest.deliveryCity,
         delivery_region: orderRequest.deliveryRegion || null,
         delivery_notes: orderRequest.deliveryNotes || null,
       })
       .select()
       .single();
 
     if (orderError) {
       console.error("Error creating order:", orderError);
       throw new Error(`Erreur création commande: ${orderError.message}`);
     }
 
     console.log("Order created:", order.id);
 
     // Create order items
     const orderItems = orderRequest.items.map((item) => ({
       order_id: order.id,
       product_id: item.productId,
       product_name: item.productName,
       product_brand: item.productBrand,
       product_image_url: item.productImageUrl,
       quantity: item.quantity,
       unit_price: item.unitPrice,
       total_price: item.subtotal,
     }));
 
     const { error: itemsError } = await supabaseClient
       .from("order_items")
       .insert(orderItems);
 
     if (itemsError) {
       console.error("Error creating order items:", itemsError);
       // Rollback order
       await supabaseClient.from("orders").delete().eq("id", order.id);
       throw new Error(`Erreur création articles: ${itemsError.message}`);
     }
 
     console.log("Order items created");
 
     // Process payment
     const paymentResponse = await fetch(`${supabaseUrl}/functions/v1/process-payment`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         orderId: order.id,
         orderNumber: orderNumber,
         amount: orderRequest.totalAmount,
         paymentMethod: orderRequest.paymentMethod,
         phoneNumber: orderRequest.deliveryPhone,
         customerName: `${orderRequest.deliveryFirstName} ${orderRequest.deliveryLastName}`,
       }),
     });
 
     const paymentResult = await paymentResponse.json();
     console.log("Payment result:", paymentResult);
 
     // Send SMS confirmation
     await sendOrderConfirmationSms(
       supabaseUrl,
       orderRequest.deliveryPhone,
       orderNumber,
       orderRequest.deliveryFirstName,
       orderRequest.totalAmount,
       orderRequest.paymentMethod
     );
 
     return new Response(
       JSON.stringify({
         success: true,
         order: {
           id: order.id,
           orderNumber: orderNumber,
           status: order.status,
           totalAmount: order.total_amount,
         },
         payment: paymentResult,
       }),
       {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   } catch (error) {
     console.error("Create order error:", error);
     return new Response(
       JSON.stringify({
         success: false,
         message: error instanceof Error ? error.message : "Erreur création commande",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });