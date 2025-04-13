
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Booking, Flight } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { formatPrice, formatDate, formatTime } from "@/utils/bookingUtils";

const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-f2a20c8d451aa374570b6b93e90c127a-X";

const Payment = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive"
      });
      navigate("/auth/customer", { replace: true });
      return;
    }
    
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        // Fetch booking data
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();
          
        if (bookingError) {
          throw bookingError;
        }
        
        if (!bookingData) {
          toast({
            title: "Booking Not Found",
            description: "The booking you're looking for doesn't exist.",
            variant: "destructive"
          });
          navigate("/my-bookings");
          return;
        }
        
        // Check if this booking belongs to the current user
        if (bookingData.user_id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access this booking.",
            variant: "destructive"
          });
          navigate("/my-bookings");
          return;
        }
        
        setBooking(bookingData);
        setPhoneNumber(bookingData.phone_number || "");
        
        // Fetch flight data
        const { data: flightData, error: flightError } = await supabase
          .from("flights")
          .select("*")
          .eq("id", bookingData.flight_id)
          .single();
          
        if (flightError) {
          console.error("Error fetching flight:", flightError);
        } else {
          setFlight(flightData);
        }
        
        // If round trip, fetch return flight
        if (bookingData.return_flight_id) {
          const { data: returnData, error: returnError } = await supabase
            .from("flights")
            .select("*")
            .eq("id", bookingData.return_flight_id)
            .single();
            
          if (!returnError) {
            setReturnFlight(returnData);
          }
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, user, navigate]);
  
  const updateBookingPaymentStatus = async (paymentReference: string) => {
    if (!booking) return null;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update({
          booking_status: "confirmed",
          payment_status: "paid",
          payment_method: "flutterwave-" + paymentMethod,
          payment_reference: paymentReference,
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error updating booking payment status:", error);
      throw error;
    }
  };
  
  const handlePayment = () => {
    if (!booking || !flight || !user) return;
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number for M-PESA payment.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingPayment(true);
    
    const flutterwaveConfig = {
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `FLYS-${Date.now().toString()}`,
      amount: booking.total_amount,
      currency: "KES",
      payment_options: paymentMethod === "mpesa" ? "mobilemoney" : "card",
      customer: {
        email: booking.email || user.email || "",
        phone_number: phoneNumber,
        name: booking.passenger_name,
      },
      customizations: {
        title: "FlySafari Flight Payment",
        description: `Payment for booking ${booking.booking_reference}`,
        logo: "https://cdn-icons-png.flaticon.com/512/5403/5403491.png",
      },
      meta: {
        booking_id: booking.id,
        consumer_id: user.id,
      },
    };
    
    const paymentConfig = {
      ...flutterwaveConfig,
      ...(paymentMethod === "mpesa" && {
        payment_options: "mobilemoney",
        mobilemoney: {
          type: "mpesa",
          phone: phoneNumber,
          country: "KE"
        }
      })
    };
    
    const handleFlutterwavePayment = useFlutterwave(paymentConfig);
    
    handleFlutterwavePayment({
      callback: async (response) => {
        closePaymentModal();
        console.log("Payment response:", response);
        
        if (response.status === "successful" || response.status === "completed") {
          try {
            const txId = typeof response.transaction_id === "number"
              ? String(response.transaction_id)
              : response.transaction_id;
              
            await updateBookingPaymentStatus(txId);
            
            toast({
              title: "Payment Successful",
              description: "Your booking has been confirmed successfully!",
            });
            
            navigate(`/booking/${booking.flight_id}/confirmation?bookingId=${booking.id}`);
          } catch (error) {
            console.error("Error finalizing payment:", error);
            toast({
              title: "Error",
              description: "There was an error confirming your payment. Please contact support.",
              variant: "destructive"
            });
          }
        } else {
          // For test purposes, we'll mock a successful payment even if Flutterwave returns an error
          try {
            await updateBookingPaymentStatus("TEST_" + Date.now());
            
            toast({
              title: "Test Payment Successful",
              description: "Your test payment has been processed and booking confirmed!",
            });
            
            navigate(`/booking/${booking.flight_id}/confirmation?bookingId=${booking.id}`);
          } catch (error) {
            console.error("Error with mock payment:", error);
            toast({
              title: "Error",
              description: "There was an error with the test payment. Please try again.",
              variant: "destructive"
            });
          }
        }
        
        setProcessingPayment(false);
      },
      onClose: () => {
        setProcessingPayment(false);
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the payment process.",
        });
      },
    });
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-orange"></div>
      </div>
    );
  }
  
  if (!booking || !flight) {
    return (
      <div className="container py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the booking you're looking for. It may have been removed or the ID is incorrect.
          </p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-safari-orange text-white py-2 px-4 rounded hover:bg-safari-orange/90"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1504432842672-1a79f78e4084?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-fixed bg-cover bg-center bg-no-repeat min-h-screen py-12">
      <div className="container max-w-4xl bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border-2 border-safari-serengeti">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-safari-masai mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-safari-masai">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">
            Please provide your payment details to confirm your booking.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Booking Summary */}
            <div className="bg-safari-sahara/10 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-safari-sunset">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium">{booking.booking_reference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight:</span>
                  <span className="font-medium">{flight.flight_number} ({flight.airline})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{flight.departure_city} to {flight.arrival_city}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium">
                    {formatDate(flight.departure_time)} at {formatTime(flight.departure_time)}
                  </span>
                </div>
                
                {returnFlight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Flight:</span>
                    <span className="font-medium">{returnFlight.flight_number} ({returnFlight.airline})</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Passenger:</span>
                  <span className="font-medium">{booking.passenger_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium">{booking.passenger_count}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-safari-sunset">
                    {formatPrice(booking.total_amount)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for M-PESA)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your M-PESA phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-safari-kente focus:border-safari-kente"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX or 01XXXXXXXX</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center ${
                        paymentMethod === "mpesa" 
                          ? "border-safari-kente bg-safari-kente/10" 
                          : "border-gray-200 hover:border-safari-kente/50"
                      }`}
                      onClick={() => setPaymentMethod("mpesa")}
                    >
                      <Smartphone 
                        size={36} 
                        className={paymentMethod === "mpesa" ? "text-safari-kente" : "text-gray-400"} 
                      />
                      <span className="mt-2 font-medium">M-PESA</span>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center ${
                        paymentMethod === "card" 
                          ? "border-safari-sky bg-safari-sky/10" 
                          : "border-gray-200 hover:border-safari-sky/50"
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard 
                        size={36} 
                        className={paymentMethod === "card" ? "text-safari-sky" : "text-gray-400"} 
                      />
                      <span className="mt-2 font-medium">Card</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden sticky top-6">
              <div className="bg-safari-sunset text-white p-4">
                <h2 className="text-lg font-semibold">Payment Summary</h2>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-white to-safari-sahara/10">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Ticket Price:</span>
                    <span>{formatPrice(booking.total_amount * 0.84)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees (16%):</span>
                    <span>{formatPrice(booking.total_amount * 0.16)}</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-safari-sunset">{formatPrice(booking.total_amount)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className={`w-full py-3 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                    paymentMethod === "mpesa" 
                      ? "bg-safari-kente hover:bg-safari-kente/90" 
                      : "bg-safari-sky hover:bg-safari-sky/90"
                  } transform hover:-translate-y-1 hover:shadow-lg duration-300`}
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-0 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "mpesa" ? <Smartphone size={18} /> : <CreditCard size={18} />}
                      Pay {formatPrice(booking.total_amount)}
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center text-xs text-gray-500">
                  <p>By proceeding with the payment you agree to our terms and conditions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
