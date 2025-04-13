import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { Plane, Calendar, Clock, ArrowLeft, Users, CreditCard, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/utils/types";
import { toast } from "@/hooks/use-toast";

const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-f2a20c8d451aa374570b6b93e90c127a-X";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idPassport: string;
  specialRequests: string;
}

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  const queryParams = new URLSearchParams(location.search);
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnFlightId] = useState<string | null>(queryParams.get('returnFlightId'));
  const [passengerCount] = useState(Number(queryParams.get('passengers')) || 1);
  const [tripType] = useState(queryParams.get('tripType') || 'oneWay');
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: "",
    idPassport: "",
    specialRequests: "",
  });
  
  useEffect(() => {
    const fetchFlightDetails = async () => {
      setLoading(true);
      
      try {
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
    
    if (id) {
      fetchFlightDetails();
    }
  }, [id, returnFlightId]);
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.primaryEmailAddress?.emailAddress || prev.email
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
  
  const calculateTotalPrice = () => {
    let basePrice = 0;
    
    if (flight) {
      basePrice += flight.price;
    }
    
    if (tripType === 'roundTrip' && returnFlight) {
      basePrice += returnFlight.price;
    }
    
    return basePrice * passengerCount;
  };
  
  const calculateTaxes = () => {
    return calculateTotalPrice() * 0.16;
  };
  
  const calculateGrandTotal = () => {
    return calculateTotalPrice() + calculateTaxes();
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Time parsing error:', e);
      return dateString;
    }
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
  
  const generateBookingReference = () => {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = 'FS';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const createBooking = async (paymentReference: string, paymentStatus: string) => {
    const bookingReference = generateBookingReference();
    
    const bookingData = {
      booking_reference: bookingReference,
      user_id: user?.id || null,
      flight_id: flight?.id,
      return_flight_id: returnFlight?.id || null,
      passenger_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone_number: formData.phone,
      id_passport_number: formData.idPassport,
      passenger_count: passengerCount,
      total_amount: calculateGrandTotal(),
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
    amount: calculateGrandTotal(),
    currency: 'KES',
    payment_options: 'mobilemoney',
    customer: {
      email: formData.email,
      phone_number: "054709929300",
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: 'FlySafari Flight Booking',
      description: flight ? `Booking for flight ${flight.flight_number} from ${flight.departure_city} to ${flight.arrival_city}` : 'Flight Booking',
      logo: 'https://cdn-icons-png.flaticon.com/512/5403/5403491.png',
    },
  };
  
  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);
  
  const handleBooking = () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        
        if (response.status === 'successful') {
          try {
            const booking = await createBooking(response.transaction_id, 'paid');
            
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
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
            className="btn bg-flysafari-primary text-white hover:bg-flysafari-primary/90"
          >
            Back to Flights
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to flight details
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-flysafari-primary text-white p-4">
                <h1 className="text-xl font-bold">Passenger Information</h1>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 254712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="idPassport" className="block text-sm font-medium text-gray-700 mb-1">
                      ID/Passport Number *
                    </label>
                    <input
                      type="text"
                      id="idPassport"
                      name="idPassport"
                      value={formData.idPassport}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special requirements or requests..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-flysafari-primary"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="bg-flysafari-primary text-white p-4">
                <h2 className="text-xl font-bold">Flight Summary</h2>
              </div>
              
              <div className="p-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-flysafari-primary mb-2">
                    <Plane size={18} />
                    <h3 className="font-semibold">
                      {tripType === 'roundTrip' ? 'Outbound Flight' : 'Selected Flight'}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      <p className="font-medium">{flight.flight_number} • {flight.airline}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-lg font-bold">{formatTime(flight.departure_time)}</p>
                          <p className="text-sm text-gray-500">{flight.departure_city}</p>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                          <p className="text-lg font-bold">{formatTime(flight.arrival_time)}</p>
                          <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-0 text-right">
                      <div className="flex items-center gap-2 justify-end text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(flight.departure_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-end mt-1 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{flight.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {tripType === 'roundTrip' && returnFlight && (
                  <div>
                    <div className="flex items-center gap-2 text-flysafari-secondary mb-2">
                      <Plane size={18} />
                      <h3 className="font-semibold">Return Flight</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <p className="font-medium">{returnFlight.flight_number} • {returnFlight.airline}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-lg font-bold">{formatTime(returnFlight.departure_time)}</p>
                            <p className="text-sm text-gray-500">{returnFlight.departure_city}</p>
                          </div>
                          <div className="text-gray-400">→</div>
                          <div>
                            <p className="text-lg font-bold">{formatTime(returnFlight.arrival_time)}</p>
                            <p className="text-sm text-gray-500">{returnFlight.arrival_city}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-0 text-right">
                        <div className="flex items-center gap-2 justify-end text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(returnFlight.departure_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end mt-1 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>{returnFlight.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18} />
                    <span>{passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>{flight.departure_city} to {flight.arrival_city}</span>
                  <span>{formatPrice(flight.price)}</span>
                </div>
                
                {returnFlight && (
                  <div className="flex justify-between">
                    <span>{returnFlight.departure_city} to {returnFlight.arrival_city}</span>
                    <span>{formatPrice(returnFlight.price)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({passengerCount} {passengerCount === 1 ? 'passenger' : 'passengers'})</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
                
                <div className="flex justify-between text-gray-500">
                  <span>Taxes & Fees (16%)</span>
                  <span>{formatPrice(calculateTaxes())}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                  <span>Total</span>
                  <span className="text-flysafari-primary">{formatPrice(calculateGrandTotal())}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <CreditCard className="text-flysafari-secondary mt-1" size={20} />
                  <div>
                    <p className="font-medium">M-Pesa (Mobile Money)</p>
                    <p className="text-sm text-gray-500">Secure payment via Flutterwave</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleBooking}
                disabled={isProcessing}
                className="w-full py-3 bg-flysafari-secondary hover:bg-flysafari-secondary/90 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-0 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay Now {formatPrice(calculateGrandTotal())}
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck size={14} />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
