 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
     const payload = await req.json();
     console.log("Payment webhook received:", JSON.stringify(payload));
 
     // Determine the payment provider from the payload structure
     let orderNumber: string | null = null;
     let paymentStatus: "COMPLETED" | "FAILED" = "FAILED";
     let provider: string = "unknown";
 
     // Wave webhook
     if (payload.client_reference && payload.payment_status) {
       provider = "wave";
       orderNumber = payload.client_reference;
       paymentStatus = payload.payment_status === "succeeded" ? "COMPLETED" : "FAILED";
     }
     // Orange Money webhook
     else if (payload.order_id && payload.status) {
       provider = "orange_money";
       orderNumber = payload.order_id;
       paymentStatus = payload.status === "SUCCESS" ? "COMPLETED" : "FAILED";
     }
     // Free Money webhook
     else if (payload.reference && payload.transaction_status) {
       provider = "free_money";
       orderNumber = payload.reference;
       paymentStatus = payload.transaction_status === "completed" ? "COMPLETED" : "FAILED";
     }
 
     if (!orderNumber) {
       console.log("Could not determine order number from webhook payload");
       return new Response(
         JSON.stringify({ success: false, message: "Invalid webhook payload" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`Processing ${provider} webhook for order ${orderNumber}, status: ${paymentStatus}`);
 
     // Update order status
     const { data: order, error } = await supabase
       .from("orders")
       .update({
         payment_status: paymentStatus,
         status: paymentStatus === "COMPLETED" ? "CONFIRMED" : "PENDING",
         updated_at: new Date().toISOString(),
       })
       .eq("order_number", orderNumber)
       .select()
       .single();
 
     if (error) {
       console.error("Error updating order:", error);
       throw error;
     }
 
     console.log("Order updated:", order.id);
 
     // Send SMS notification for successful payment
     if (paymentStatus === "COMPLETED" && order) {
       const message = `✅ BichriTech - Paiement Confirmé!\n\nVotre paiement pour la commande ${orderNumber} a été reçu.\n\nVotre commande est en cours de préparation.\n\nMerci!`;
 
       await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           to: order.delivery_phone,
           message: message,
           orderNumber: orderNumber,
         }),
       });
     }
 
     return new Response(
       JSON.stringify({ success: true, orderNumber, paymentStatus }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Webhook processing error:", error);
     return new Response(
       JSON.stringify({
         success: false,
         message: error instanceof Error ? error.message : "Webhook processing failed",
       }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });