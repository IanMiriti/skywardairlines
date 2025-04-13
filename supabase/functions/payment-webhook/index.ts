
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ytcpgoyldllvumfmieas.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Flutterwave webhook secret (would be set in production)
const flutterwaveSecretHash = Deno.env.get("FLUTTERWAVE_SECRET_HASH") || "";

// CORS headers for the response
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the request body
    const body = await req.json();
    console.log("Received webhook payload:", body);
    
    // Verify webhook signature (in production)
    const signature = req.headers.get("verif-hash");
    if (flutterwaveSecretHash && signature !== flutterwaveSecretHash) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process the webhook
    const { event, data } = body;
    
    // Handle payment confirmation
    if (event === "charge.completed" && data && data.status === "successful") {
      const { tx_ref, flw_ref, amount, customer, currency } = data;
      
      console.log(`Processing successful payment: ${flw_ref} for ${amount} ${currency}`);
      
      // Find the booking by payment reference or tx_ref
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("payment_reference", tx_ref)
        .maybeSingle();
      
      if (bookingError) {
        console.error("Error finding booking:", bookingError);
        throw bookingError;
      }
      
      if (!bookings) {
        console.warn(`No booking found for payment reference: ${tx_ref}`);
        return new Response(
          JSON.stringify({ success: false, message: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "completed",
          booking_status: "confirmed",
          payment_reference: flw_ref, // Use the Flutterwave reference
          updated_at: new Date().toISOString()
        })
        .eq("id", bookings.id);
      
      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw updateError;
      }
      
      console.log(`Successfully updated booking status for: ${bookings.booking_reference}`);
      
      // Update flight available seats (decrement by passenger count)
      if (bookings.flight_id) {
        const { error: flightUpdateError } = await supabase.rpc(
          "decrement_available_seats",
          {
            flight_id: bookings.flight_id,
            seats_count: bookings.passenger_count
          }
        );
        
        if (flightUpdateError) {
          console.error("Error updating flight seats:", flightUpdateError);
          // Don't throw here, as the booking is already confirmed
        }
      }
      
      // If round trip, update return flight seats as well
      if (bookings.is_round_trip && bookings.return_flight_id) {
        const { error: returnFlightUpdateError } = await supabase.rpc(
          "decrement_available_seats",
          {
            flight_id: bookings.return_flight_id,
            seats_count: bookings.passenger_count
          }
        );
        
        if (returnFlightUpdateError) {
          console.error("Error updating return flight seats:", returnFlightUpdateError);
        }
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ success: true, message: "Booking confirmed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle payment failures
    if (event === "charge.failed" && data) {
      const { tx_ref, flw_ref } = data;
      
      console.log(`Processing failed payment: ${flw_ref}`);
      
      // Find the booking
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("payment_reference", tx_ref)
        .maybeSingle();
      
      if (bookingError) {
        console.error("Error finding booking:", bookingError);
        throw bookingError;
      }
      
      if (!bookings) {
        console.warn(`No booking found for payment reference: ${tx_ref}`);
        return new Response(
          JSON.stringify({ success: false, message: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update booking status to failed
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          booking_status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", bookings.id);
      
      if (updateError) {
        console.error("Error updating booking status:", updateError);
        throw updateError;
      }
      
      console.log(`Updated booking status to failed for: ${bookings.booking_reference}`);
      
      // Return response
      return new Response(
        JSON.stringify({ success: true, message: "Booking marked as failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Default response for unhandled events
    return new Response(
      JSON.stringify({ success: true, message: "Webhook received, but no action taken" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
