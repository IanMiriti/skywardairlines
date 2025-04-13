
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { PassengerForm } from "@/components/booking/PassengerForm";
import { FlightSummary } from "@/components/booking/FlightSummary";
import { PaymentForm } from "@/components/booking/PaymentForm";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { 
  calculateGrandTotal, 
  generateBookingReference 
} from "@/utils/bookingUtils";

const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-f2a20c8d451aa374570b6b93e90c127a-X";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idPassport: string;
  specialRequests: string;
  paymentMethod: "mpesa" | "card";
}

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnFlightId] = useState<string | null>(queryParams.get('returnFlightId'));
  const [passengerCount] = useState(Number(queryParams.get('passengers')) || 1);
  const [tripType] = useState(queryParams.get('tripType') || 'oneWay');
  const [bookingId] = useState<string | null>(queryParams.get('bookingId'));
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idPassport: "",
    specialRequests: "",
    paymentMethod: "mpesa"
  });
  
  useEffect(() => {
    const fetchFlightDetails = async () => {
      setLoading(true);
      
      try {
        // If bookingId is provided, fetch booking to get flight info
        if (bookingId) {
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
              *,
              flight:flight_id(*),
              return_flight:return_flight_id(*)
            `)
            .eq('id', bookingId)
            .single();
            
          if (bookingError) {
            throw bookingError;
          }
          
          if (bookingData) {
            setFlight(bookingData.flight);
            setReturnFlight(bookingData.return_flight);
            setFormData({
              firstName: bookingData.passenger_name.split(' ')[0] || "",
              lastName: bookingData.passenger_name.split(' ').slice(1).join(' ') || "",
              email: bookingData.email || "",
              phone: bookingData.phone_number || "",
              idPassport: bookingData.id_passport_number || "",
              specialRequests: bookingData.special_requests || "",
              paymentMethod: "mpesa"
            });
          }
        } else {
          // Normal flow - fetch flight by ID
          const { data, error } = await supabase
            .from('flights')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            throw error;
          }
          
          setFlight(data);
          
          if (returnFlightId) {
            const { data: returnData, error: returnError } = await supabase
              .from('flights')
              .select('*')
              .eq('id', returnFlightId)
              .single();
              
            if (returnError) {
              console.error('Error fetching return flight:', returnError);
            } else {
              setReturnFlight(returnData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching flight details:', error);
        toast({
          title: "Error",
          description: "Failed to load flight details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id || bookingId) {
      fetchFlightDetails();
    }
  }, [id, returnFlightId, bookingId]);
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.user_metadata?.full_name?.split(' ')[0] || prev.firstName,
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.user_metadata?.phone || prev.phone
      }));
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (value: "mpesa" | "card") => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };
  
  const validateForm = () => {
    const { firstName, lastName, email, phone, idPassport } = formData;
    
    if (!firstName || !lastName || !email || !phone || !idPassport) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const updateBooking = async (paymentReference: string, paymentStatus: string) => {
    if (!bookingId) return null;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          passenger_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone_number: formData.phone,
          id_passport_number: formData.idPassport,
          booking_status: 'confirmed',
          payment_status: paymentStatus,
          payment_method: 'flutterwave',
          payment_reference: paymentReference,
          special_requests: formData.specialRequests || null,
        })
        .eq('id', bookingId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };
  
  const createBooking = async (paymentReference: string, paymentStatus: string) => {
    if (!flight || !user) return null;
    
    const bookingReference = generateBookingReference();
    
    const bookingData = {
      booking_reference: bookingReference,
      user_id: user.id,
      flight_id: flight.id,
      return_flight_id: returnFlight?.id || null,
      passenger_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone_number: formData.phone,
      id_passport_number: formData.idPassport,
      passenger_count: passengerCount,
      total_amount: calculateGrandTotal(flight, returnFlight, passengerCount, tripType),
      booking_status: 'confirmed',
      payment_status: paymentStatus,
      payment_method: 'flutterwave',
      payment_reference: paymentReference,
      is_round_trip: tripType === 'roundTrip',
      special_requests: formData.specialRequests || null,
    };
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };
  
  const flutterwaveConfig = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `FLYS-${Date.now().toString()}`,
    amount: flight ? calculateGrandTotal(flight, returnFlight, passengerCount, tripType) : 0,
    currency: 'KES',
    payment_options: formData.paymentMethod === "mpesa" ? "mobilemoney" : "card",
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: 'FlySafari Flight Booking',
      description: flight ? `Booking for flight ${flight.flight_number} from ${flight.departure_city} to ${flight.arrival_city}` : 'Flight Booking',
      logo: 'https://cdn-icons-png.flaticon.com/512/5403/5403491.png',
    },
    meta: {
      consumer_id: user?.id || 'guest-user',
      consumer_mac: "92a3-912ba-1192a",
    },
    payment_plan: null,
  };
  
  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);
  
  const handleBooking = () => {
    if (!validateForm() || !flight) return;
    
    setIsProcessing(true);
    
    const paymentConfig = {
      ...flutterwaveConfig,
      ...(formData.paymentMethod === "mpesa" && {
        payment_options: "mobilemoney",
        mobilemoney: {
          type: "mpesa",
          phone: formData.phone,
          country: "KE"
        }
      })
    };
    
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        
        if (response.status === 'successful' || response.status === 'completed') {
          try {
            const txId = typeof response.transaction_id === 'number' 
              ? String(response.transaction_id) 
              : response.transaction_id;
            
            let booking;
            
            if (bookingId) {
              // Update existing booking
              booking = await updateBooking(txId, 'paid');
            } else {
              // Create new booking
              booking = await createBooking(txId, 'paid');
            }
            
            navigate(`/booking/${id}/confirmation?bookingId=${booking.id}`);
            
            toast({
              title: "Success",
              description: "Your booking has been confirmed!",
            });
          } catch (error) {
            console.error('Error finalizing booking:', error);
            toast({
              title: "Error",
              description: "There was an error confirming your booking. Please contact support.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive"
          });
        }
        
        setIsProcessing(false);
      },
      onClose: () => {
        setIsProcessing(false);
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
  
  if (!flight) {
    return (
      <div className="container py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Flight Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the flight you're looking for. It may have been removed or the ID is incorrect.
          </p>
          <button
            onClick={() => navigate('/flights')}
            className="btn bg-safari-orange text-white hover:bg-safari-orange/90"
          >
            Back to Flights
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1504432842672-1a79f78e4084?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-fixed bg-cover bg-center bg-no-repeat min-h-screen py-12">
      <div className="container bg-white bg-opacity-90 rounded-xl shadow-xl backdrop-blur-sm p-6 md:p-8 border-2 border-safari-serengeti">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-safari-masai mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to flight details
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PassengerForm 
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <FlightSummary 
              flight={flight}
              returnFlight={returnFlight}
              passengerCount={passengerCount}
              tripType={tripType}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="african-card sticky top-6">
              <div className="bg-safari-sunset text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Payment Summary</h2>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-white to-safari-sahara/10">
                <PriceSummary 
                  flight={flight}
                  returnFlight={returnFlight}
                  passengerCount={passengerCount}
                  tripType={tripType}
                />
                
                <PaymentForm 
                  isProcessing={isProcessing}
                  totalAmount={calculateGrandTotal(flight, returnFlight, passengerCount, tripType)}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  paymentMethod={formData.paymentMethod}
                  onSubmit={handleBooking}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
