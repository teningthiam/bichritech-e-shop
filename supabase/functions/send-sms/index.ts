 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface SmsRequest {
   to: string;
   message: string;
   orderNumber?: string;
 }
 
 interface SmsResponse {
   success: boolean;
   messageId?: string;
   message: string;
 }
 
 // Format phone number for Senegal
 function formatPhoneNumber(phone: string): string {
   // Remove spaces and special characters
   let cleaned = phone.replace(/[\s\-\(\)]/g, "");
   
   // Add country code if missing
   if (cleaned.startsWith("7") && cleaned.length === 9) {
     cleaned = "+221" + cleaned;
   } else if (cleaned.startsWith("221") && !cleaned.startsWith("+")) {
     cleaned = "+" + cleaned;
   } else if (!cleaned.startsWith("+221") && cleaned.length >= 9) {
     // Try to extract the 9-digit number
     const digits = cleaned.replace(/\D/g, "");
     if (digits.length >= 9) {
       cleaned = "+221" + digits.slice(-9);
     }
   }
   
   return cleaned;
 }
 
 // Twilio SMS Integration
 async function sendViaTwilio(to: string, message: string): Promise<SmsResponse> {
   const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
   const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
   const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
 
   if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
     console.log("Twilio credentials not configured - simulating SMS");
     return {
       success: true,
       messageId: `SIM_${Date.now()}`,
       message: "SMS simulé - Configuration Twilio requise",
     };
   }
 
   try {
     const formattedPhone = formatPhoneNumber(to);
     
     const response = await fetch(
       `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
       {
         method: "POST",
         headers: {
           "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
           "Content-Type": "application/x-www-form-urlencoded",
         },
         body: new URLSearchParams({
           To: formattedPhone,
           From: TWILIO_PHONE_NUMBER,
           Body: message,
         }),
       }
     );
 
     const data = await response.json();
 
     if (response.ok) {
       console.log("SMS sent successfully:", data.sid);
       return {
         success: true,
         messageId: data.sid,
         message: "SMS envoyé avec succès",
       };
     } else {
       throw new Error(data.message || "Erreur Twilio");
     }
   } catch (error) {
     console.error("Twilio SMS error:", error);
     return {
       success: false,
       message: `Erreur SMS: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
     };
   }
 }
 
 // Orange SMS API Integration (Alternative for Senegal)
 async function sendViaOrangeSms(to: string, message: string): Promise<SmsResponse> {
   const ORANGE_SMS_API_KEY = Deno.env.get("ORANGE_SMS_API_KEY");
   const ORANGE_SMS_SENDER = Deno.env.get("ORANGE_SMS_SENDER") || "BichriTech";
 
   if (!ORANGE_SMS_API_KEY) {
     // Fall back to Twilio if Orange SMS not configured
     return sendViaTwilio(to, message);
   }
 
   try {
     // Get OAuth token
     const tokenResponse = await fetch("https://api.orange.com/oauth/v3/token", {
       method: "POST",
       headers: {
         "Authorization": `Basic ${btoa(ORANGE_SMS_API_KEY)}`,
         "Content-Type": "application/x-www-form-urlencoded",
       },
       body: "grant_type=client_credentials",
     });
 
     const tokenData = await tokenResponse.json();
     
     if (!tokenResponse.ok) {
       throw new Error("Erreur d'authentification Orange SMS");
     }
 
     const formattedPhone = formatPhoneNumber(to);
     
     // Send SMS
     const smsResponse = await fetch(
       "https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B221/requests",
       {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${tokenData.access_token}`,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           outboundSMSMessageRequest: {
             address: `tel:${formattedPhone}`,
             senderAddress: `tel:${ORANGE_SMS_SENDER}`,
             outboundSMSTextMessage: {
               message: message,
             },
           },
         }),
       }
     );
 
     const smsData = await smsResponse.json();
 
     if (smsResponse.ok) {
       return {
         success: true,
         messageId: smsData.outboundSMSMessageRequest?.resourceURL || `ORANGE_${Date.now()}`,
         message: "SMS envoyé via Orange",
       };
     } else {
       throw new Error(smsData.message || "Erreur Orange SMS API");
     }
   } catch (error) {
     console.error("Orange SMS error:", error);
     // Fall back to Twilio
     return sendViaTwilio(to, message);
   }
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const smsRequest: SmsRequest = await req.json();
     
     console.log("Sending SMS to:", smsRequest.to);
 
     // Try Orange SMS first (local), then Twilio (international)
     const result = await sendViaOrangeSms(smsRequest.to, smsRequest.message);
 
     return new Response(JSON.stringify(result), {
       status: result.success ? 200 : 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("SMS sending error:", error);
     return new Response(
       JSON.stringify({
         success: false,
         message: error instanceof Error ? error.message : "Erreur d'envoi SMS",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });