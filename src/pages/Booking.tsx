import React, { useState, useEffect } from "react";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { 
  Plane, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  Shield,
  Phone,
  Mail,
  User,
  ArrowLeft,
  CreditCard as CreditCardIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeftRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flight } from "@/utils/types";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idPassport: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { user, isSignedIn, isLoaded } = useUser();
  
  const [passengerCount, setPassengerCount] = useState(Number(queryParams.get('passengers')) || 1);
  const [tripType] = useState(queryParams.get('tripType') || 'oneWay');
  const [returnFlightId] = useState(queryParams.get('returnFlightId') || null);
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idPassport: "",
    specialRequests: "",
    agreeToTerms: false
  });
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  
  const generateBookingReference = () => {
    const prefix = 'FS';
    const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${prefix}${randomDigits}`;
  };
  
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || ""
      }));
    }
  }, [isLoaded, isSignedIn, user]);
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const inputValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue
    });
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
  
  const saveBooking = async (paymentReference: string = "", paymentStatus: string = "pending") => {
    try {
      const ref = generateBookingReference();
      setBookingReference(ref);
      
      if (!isSignedIn || !user) {
        throw new Error("User must be signed in to complete booking");
      }
      
      const bookingData = {
        user_id: user.id,
        flight_id: id,
        booking_reference: ref,
        passenger_name: `${formData.firstName} ${formData.lastName}`,
        id_passport_number: formData.idPassport,
        phone_number: formData.phone,
        email: formData.email,
        passenger_count: passengerCount,
        total_amount: calculateGrandTotal(),
        payment_method: "M-PESA via Flutterwave",
        payment_reference: paymentReference,
        payment_status: paymentStatus,
        booking_status: paymentStatus === "completed" ? "confirmed" : "pending",
        is_round_trip: tripType === 'roundTrip',
        return_flight_id: returnFlightId,
        special_requests: formData.specialRequests || null
      };
      
      console.log("Booking data being inserted:", bookingData);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select();
        
      if (error) {
        console.error("Supabase insert error:", error.message, error.details, error.hint);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Booking Error",
        description: "Failed to save booking details.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const flutterwaveConfig = {
    public_key: "FLWPUBK_TEST-f2a20c8d451aa374570b6b93e90c127a-X",
    tx_ref: `FLYS-${Date.now().toString()}`,
    amount: calculateGrandTotal().toString(),
    currency: 'KES',
    payment_options: 'mpesa',
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: `${formData.firstName} ${formData.lastName}`,
    },
    customizations: {
      title: 'FlySafari Flight Booking',
      description: `Booking for flight ${flight?.flight_number} from ${flight?.departure_city} to ${flight?.arrival_city}`,
      logo: 'https://cdn-icons-png.flaticon.com/512/5403/5403491.png',
    },
  };
  
  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);
  
  const initiatePayment = async () => {
    try {
      const pendingBooking = await saveBooking("pending", "pending");
      
      handleFlutterwavePayment({
        callback: async (response) => {
          console.log("Payment callback:", response);
          closePaymentModal();
          
          if (response.status === "successful") {
            setIsProcessingPayment(true);
            
            try {
              const verificationResponse = await fetch(
                `https://ytcpgoyldllvumfmieas.functions.supabase.co/verify-flutterwave-payment`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    transactionId: response.transaction_id,
                    amount: calculateGrandTotal(),
                    currency: 'KES',
                  }),
                }
              );
              
              const verificationData = await verificationResponse.json();
              
              if (verificationData.success) {
                const booking = await saveBooking(response.transaction_id, "completed");
                setPaymentSuccess(true);
                
                navigate(`/booking/${id}/confirmation?bookingId=${booking.id}&reference=${booking.booking_reference}`);
              } else {
                setPaymentError("Payment verification failed. Please contact support.");
              }
            } catch (error) {
              console.error("Error processing successful payment:", error);
              setPaymentError("Payment was successful but we couldn't complete your booking. Please contact support.");
            } finally {
              setIsProcessingPayment(false);
            }
          } else {
            setPaymentError("Payment was not successful. Please try again.");
          }
        },
        onClose: () => {
          console.log("Payment modal closed");
        }
      });
    } catch (error) {
      console.error("Error creating pending booking:", error);
      toast({
        title: "Booking Error",
        description: "Could not create booking. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.idPassport) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    if (tripType === 'roundTrip' && !returnFlightId) {
      toast({
        title: "Return Flight Required",
        description: "Please select a return flight for your round trip booking.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isSignedIn) {
      toast({
        title: "Login Required",
        description: "Please sign in to complete your booking.",
        variant: "default"
      });
      
      localStorage.setItem('pendingBooking', JSON.stringify({
        flightId: id,
        returnFlightId: returnFlightId,
        passengerCount,
        tripType,
        formData
      }));
      
      navigate('/sign-in?redirectTo=' + encodeURIComponent(`/booking/${id}?${queryParams.toString()}`));
      return;
    }
    
    initiatePayment();
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
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Flight Not Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the flight you're looking for.
        </p>
        <button
          onClick={() => navigate("/flights")}
          className="btn btn-primary"
        >
          Browse Flights
        </button>
      </div>
    );
  }
  
  if (isProcessingPayment) {
    return (
      <div className="container py-16 text-center">
        <Loader2 size={48} className="animate-spin text-flysafari-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Processing Your Booking</h2>
        <p className="text-gray-600 mb-8">Please wait while we confirm your payment and complete your booking...</p>
      </div>
    );
  }
  
  if (paymentError) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
        <p className="text-gray-600 mb-6">{paymentError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (paymentSuccess) {
    return (
      <div className="container py-16 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
        <p className="text-gray-600 mb-2">Your booking reference: <span className="font-semibold">{bookingReference}</span></p>
        <p className="text-gray-600 mb-6">We've sent your e-ticket to your email.</p>
        <button
          onClick={() => navigate("/my-bookings")}
          className="btn btn-primary"
        >
          View My Bookings
        </button>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-flysafari-primary text-white p-4">
                <h1 className="text-xl font-bold">Complete Your Booking</h1>
              </div>
              
              <SignedOut>
                <div className="bg-yellow-50 p-4 border-b border-yellow-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-700">Sign in to complete your booking</h3>
                      <p className="text-sm mt-1 text-yellow-600">
                        You need to be signed in to complete your booking. You can continue filling out your details, but you'll need to sign in before payment.
                      </p>
                    </div>
                  </div>
                </div>
              </SignedOut>
              
              <form onSubmit={handleFormSubmit} className="p-6">
                <h2 className="text-lg font-semibold mb-4">Passenger Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="pl-10 w-full"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="pl-10 w-full"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-10 w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="pl-10 w-full"
                        placeholder="e.g. 07XXXXXXXX"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This number will be used for M-PESA payment and flight updates.
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="idPassport" className="block text-sm font-medium text-gray-700 mb-1">
                      ID / Passport Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="text"
                        id="idPassport"
                        name="idPassport"
                        value={formData.idPassport}
                        onChange={handleInputChange}
                        required
                        className="pl-10 w-full"
                        placeholder="Enter your ID or passport number"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Required for security and check-in purposes.
                    </p>
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
                    className="form-input w-full"
                    placeholder="Any special requests or requirements"
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-flysafari-primary hover:underline">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-flysafari-primary hover:underline">
                        Privacy Policy
                      </a>
                      . I confirm that the information provided is accurate.
                    </span>
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md mb-6">
                  <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-flysafari-primary" />
                    Secure Booking Guarantee
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your payment and personal information are protected by secure encryption.
                    We use Flutterwave, a trusted payment gateway for secure M-PESA transactions.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full py-6 text-base flex items-center justify-center gap-2"
                >
                  <CreditCardIcon size={18} />
                  Proceed to Payment
                </Button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {tripType === 'roundTrip' && (
                <div className="mb-4 inline-flex items-center gap-2 bg-flysafari-primary/10 text-flysafari-primary py-1 px-3 rounded-full text-sm">
                  <ArrowLeftRight size={16} />
                  <span>Round Trip</span>
                </div>
              )}
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Plane size={18} className="text-flysafari-primary" />
                    <span className="font-medium">
                      {tripType === 'roundTrip' ? 'Outbound' : 'Flight'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{flight.flight_number}</span>
                </div>
                
                <div className="flex items-center my-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(flight.departure_time)}</p>
                    <p className="text-sm text-gray-500">{flight.departure_city}</p>
                  </div>
                  <div className="mx-3 flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                    <div className="w-full h-0.5 bg-gray-300 relative">
                      <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                      <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatTime(flight.arrival_time)}</p>
                    <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{formatDate(flight.departure_time)}</span>
                  <span className="text-sm font-medium">{formatPrice(flight.price)}</span>
                </div>
              </div>
              
              {tripType === 'roundTrip' && returnFlight && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Plane size={18} className="text-flysafari-secondary" />
                      <span className="font-medium">Return</span>
                    </div>
                    <span className="text-sm text-gray-500">{returnFlight.flight_number}</span>
                  </div>
                  
                  <div className="flex items-center my-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatTime(returnFlight.departure_time)}</p>
                      <p className="text-sm text-gray-500">{returnFlight.departure_city}</p>
                    </div>
                    <div className="mx-3 flex flex-col items-center flex-1">
                      <div className="text-xs text-gray-500 mb-1">{returnFlight.duration}</div>
                      <div className="w-full h-0.5 bg-gray-300 relative">
                        <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                        <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatTime(returnFlight.arrival_time)}</p>
                      <p className="text-sm text-gray-500">{returnFlight.arrival_city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatDate(returnFlight.departure_time)}</span>
                    <span className="text-sm font-medium">{formatPrice(returnFlight.price)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4 py-2">
                <span>Passengers</span>
                <span>{passengerCount} {passengerCount === 1 ? 'passenger' : 'passengers'}</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Flight Price</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>{formatPrice(calculateTaxes())}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                  <span>Total</span>
                  <span className="text-flysafari-primary">
                    {formatPrice(calculateGrandTotal())}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CreditCardIcon size={16} className="text-flysafari-primary" />
                  Payment Method
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Payment via M-PESA, processed securely by Flutterwave.
                </p>
                <div className="flex items-center justify-center">
                  <img 
                    src="https://cdn.filestackcontent.com/oEP1I38aTtyRlEUo0VkX" 
                    alt="M-PESA Logo" 
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
