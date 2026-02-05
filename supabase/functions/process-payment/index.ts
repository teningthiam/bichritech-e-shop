 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface PaymentRequest {
   orderId: number;
   orderNumber: string;
   amount: number;
   paymentMethod: "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "CASH_ON_DELIVERY";
   phoneNumber: string;
   customerName: string;
 }
 
 interface PaymentResponse {
   success: boolean;
   transactionId?: string;
   paymentUrl?: string;
   message: string;
   status: "PENDING" | "COMPLETED" | "FAILED";
 }
 
 // Wave Payment Integration
 // Documentation: https://developer.wave.com
 async function processWavePayment(request: PaymentRequest): Promise<PaymentResponse> {
   const WAVE_API_KEY = Deno.env.get("WAVE_API_KEY");
   const WAVE_MERCHANT_ID = Deno.env.get("WAVE_MERCHANT_ID");
   
   if (!WAVE_API_KEY || !WAVE_MERCHANT_ID) {
     console.log("Wave API keys not configured - simulating payment");
     // Simulation mode when keys are not configured
     return {
       success: true,
       transactionId: `WAVE_SIM_${Date.now()}`,
       message: "Paiement Wave simulé - En attente de configuration API",
       status: "PENDING",
     };
   }
 
   try {
     // Real Wave API call
     const response = await fetch("https://api.wave.com/v1/checkout/sessions", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${WAVE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         amount: request.amount,
         currency: "XOF",
         error_url: `${Deno.env.get("SITE_URL") || "https://bichri-tech.lovable.app"}/checkout?error=true`,
         success_url: `${Deno.env.get("SITE_URL") || "https://bichri-tech.lovable.app"}/order-success?order=${request.orderNumber}`,
         client_reference: request.orderNumber,
       }),
     });
 
     const data = await response.json();
     
     if (response.ok && data.wave_launch_url) {
       return {
         success: true,
         transactionId: data.id,
         paymentUrl: data.wave_launch_url,
         message: "Redirection vers Wave",
         status: "PENDING",
       };
     } else {
       throw new Error(data.message || "Erreur Wave API");
     }
   } catch (error) {
     console.error("Wave payment error:", error);
     return {
       success: false,
       message: `Erreur Wave: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
       status: "FAILED",
     };
   }
 }
 
 // Orange Money Payment Integration
 // Documentation: https://developer.orange.com/apis/om-webpay
 async function processOrangeMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
   const ORANGE_API_KEY = Deno.env.get("ORANGE_MONEY_API_KEY");
   const ORANGE_MERCHANT_KEY = Deno.env.get("ORANGE_MONEY_MERCHANT_KEY");
   
   if (!ORANGE_API_KEY || !ORANGE_MERCHANT_KEY) {
     console.log("Orange Money API keys not configured - simulating payment");
     return {
       success: true,
       transactionId: `OM_SIM_${Date.now()}`,
       message: "Paiement Orange Money simulé - En attente de configuration API",
       status: "PENDING",
     };
   }
 
   try {
     // Get OAuth token first
     const tokenResponse = await fetch("https://api.orange.com/oauth/v3/token", {
       method: "POST",
       headers: {
         "Authorization": `Basic ${btoa(ORANGE_API_KEY)}`,
         "Content-Type": "application/x-www-form-urlencoded",
       },
       body: "grant_type=client_credentials",
     });
 
     const tokenData = await tokenResponse.json();
     
     if (!tokenResponse.ok) {
       throw new Error("Erreur d'authentification Orange");
     }
 
     // Create payment
     const paymentResponse = await fetch("https://api.orange.com/orange-money-webpay/dev/v1/webpayment", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${tokenData.access_token}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         merchant_key: ORANGE_MERCHANT_KEY,
         currency: "OUV",
         order_id: request.orderNumber,
         amount: request.amount,
         return_url: `${Deno.env.get("SITE_URL") || "https://bichri-tech.lovable.app"}/order-success?order=${request.orderNumber}`,
         cancel_url: `${Deno.env.get("SITE_URL") || "https://bichri-tech.lovable.app"}/checkout?error=true`,
         notif_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
         lang: "fr",
         reference: request.orderNumber,
       }),
     });
 
     const paymentData = await paymentResponse.json();
 
     if (paymentResponse.ok && paymentData.payment_url) {
       return {
         success: true,
         transactionId: paymentData.pay_token,
         paymentUrl: paymentData.payment_url,
         message: "Redirection vers Orange Money",
         status: "PENDING",
       };
     } else {
       throw new Error(paymentData.message || "Erreur Orange Money API");
     }
   } catch (error) {
     console.error("Orange Money payment error:", error);
     return {
       success: false,
       message: `Erreur Orange Money: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
       status: "FAILED",
     };
   }
 }
 
 // Free Money Payment Integration
 async function processFreeMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
   const FREE_MONEY_API_KEY = Deno.env.get("FREE_MONEY_API_KEY");
   const FREE_MONEY_MERCHANT_ID = Deno.env.get("FREE_MONEY_MERCHANT_ID");
   
   if (!FREE_MONEY_API_KEY || !FREE_MONEY_MERCHANT_ID) {
     console.log("Free Money API keys not configured - simulating payment");
     return {
       success: true,
       transactionId: `FM_SIM_${Date.now()}`,
       message: "Paiement Free Money simulé - En attente de configuration API",
       status: "PENDING",
     };
   }
 
   try {
     // Free Money API integration
     const response = await fetch("https://api.freemoney.sn/v1/payments", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${FREE_MONEY_API_KEY}`,
         "X-Merchant-ID": FREE_MONEY_MERCHANT_ID,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         amount: request.amount,
         currency: "XOF",
         phone: request.phoneNumber,
         reference: request.orderNumber,
         callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
         success_url: `${Deno.env.get("SITE_URL") || "https://bichri-tech.lovable.app"}/order-success?order=${request.orderNumber}`,
       }),
     });
 
     const data = await response.json();
 
     if (response.ok && data.payment_url) {
       return {
         success: true,
         transactionId: data.transaction_id,
         paymentUrl: data.payment_url,
         message: "Redirection vers Free Money",
         status: "PENDING",
       };
     } else {
       throw new Error(data.message || "Erreur Free Money API");
     }
   } catch (error) {
     console.error("Free Money payment error:", error);
     return {
       success: false,
       message: `Erreur Free Money: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
       status: "FAILED",
     };
   }
 }
 
 // Cash on Delivery - No payment processing needed
 function processCashOnDelivery(request: PaymentRequest): PaymentResponse {
   return {
     success: true,
     transactionId: `COD_${Date.now()}`,
     message: "Commande confirmée - Paiement à la livraison",
     status: "PENDING",
   };
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const paymentRequest: PaymentRequest = await req.json();
     
     console.log("Processing payment:", paymentRequest.paymentMethod, "for order:", paymentRequest.orderNumber);
 
     let result: PaymentResponse;
 
     switch (paymentRequest.paymentMethod) {
       case "WAVE":
         result = await processWavePayment(paymentRequest);
         break;
       case "ORANGE_MONEY":
         result = await processOrangeMoneyPayment(paymentRequest);
         break;
       case "FREE_MONEY":
         result = await processFreeMoneyPayment(paymentRequest);
         break;
       case "CASH_ON_DELIVERY":
         result = processCashOnDelivery(paymentRequest);
         break;
       default:
         result = {
           success: false,
           message: "Méthode de paiement non supportée",
           status: "FAILED",
         };
     }
 
     // Update order payment status in database
     if (result.success) {
       const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
       const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
       const supabase = createClient(supabaseUrl, supabaseKey);
 
       await supabase
         .from("orders")
         .update({
           payment_status: result.status === "COMPLETED" ? "COMPLETED" : "PENDING",
           status: paymentRequest.paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "PENDING",
         })
         .eq("id", paymentRequest.orderId);
     }
 
     return new Response(JSON.stringify(result), {
       status: 200,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Payment processing error:", error);
     return new Response(
       JSON.stringify({
         success: false,
         message: error instanceof Error ? error.message : "Erreur de traitement",
         status: "FAILED",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });