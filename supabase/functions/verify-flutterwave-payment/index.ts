
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY") || "FLWSECK_TEST-aafaf87767a6712fd5a7224ac2c103f3-X"; // Using test key for development

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get request body
    const body = await req.json();
    const { transactionId, amount, currency } = body;
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Verifying transaction: ${transactionId}`);
    
    // Verify the transaction with Flutterwave
    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${flutterwaveSecretKey}`
        }
      }
    );
    
    const verifyData = await verifyResponse.json();
    console.log("Verification response:", JSON.stringify(verifyData));
    
    // Check if the verification was successful
    if (verifyData.status === "success" && verifyData.data) {
      const paymentData = verifyData.data;
      
      // Verify that the amount and currency match
      const isValidAmount = Math.abs(paymentData.amount - amount) < 0.01; // Using small epsilon for floating point comparison
      const isValidCurrency = paymentData.currency === currency;
      const isSuccessful = paymentData.status === "successful";
      
      if (isValidAmount && isValidCurrency && isSuccessful) {
        // Payment is verified
        console.log(`Payment verified successfully for transaction: ${transactionId}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Payment verified successfully", 
            data: {
              transactionId: paymentData.id,
              amount: paymentData.amount,
              currency: paymentData.currency,
              customerEmail: paymentData.customer?.email
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Payment verification failed
        console.warn(`Payment verification failed for transaction: ${transactionId}`);
        console.warn(`Valid amount: ${isValidAmount}, Valid currency: ${isValidCurrency}, Successful: ${isSuccessful}`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Payment verification failed", 
            reason: !isSuccessful ? "Payment not successful" : 
                    !isValidAmount ? "Amount mismatch" : 
                    "Currency mismatch"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Transaction not found or verification failed
      console.error(`Transaction verification failed: ${verifyData.message || "Unknown error"}`);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Transaction verification failed", 
          reason: verifyData.message || "Unknown error" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Payment verification failed due to an error", 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
