
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plane, Calendar, Clock, Users, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { generateBookingReference } from "@/utils/bookingUtils";

const FlightDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [passengerCount, setPassengerCount] = useState(1);
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (!id) return;
      
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
        
        // Set the departure date to tomorrow by default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDepartureDate(tomorrow.toISOString().split('T')[0]);
        
        // Set the return date to a week from tomorrow by default
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 8);
        setReturnDate(nextWeek.toISOString().split('T')[0]);
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
    
    fetchFlightDetails();
  }, [id]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const calculateTotalPrice = () => {
    if (!flight) return 0;
    
    let total = flight.price * passengerCount;
    
    if (tripType === 'roundTrip') {
      // For round trip, double the flight price
      total *= 2;
    }
    
    return total;
  };
  
  const validateBookingForm = () => {
    if (!departureDate) {
      toast({
        title: "Departure Date Required",
        description: "Please select a departure date.",
        variant: "destructive"
      });
      return false;
    }
    
    if (tripType === 'roundTrip' && !returnDate) {
      toast({
        title: "Return Date Required",
        description: "Please select a return date for your round trip.",
        variant: "destructive"
      });
      return false;
    }
    
    if (tripType === 'roundTrip' && departureDate >= returnDate) {
      toast({
        title: "Invalid Dates",
        description: "Return date must be after departure date.",
        variant: "destructive"
      });
      return false;
    }
    
    const departureDateTime = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDateTime < today) {
      toast({
        title: "Invalid Departure Date",
        description: "Departure date cannot be in the past.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleBookNow = async () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Validate form
    if (!validateBookingForm()) {
      return;
    }
    
    setIsBooking(true);
    
    try {
      // Create a booking reference
      const bookingReference = generateBookingReference();
      
      // Calculate total price
      const totalAmount = calculateTotalPrice();
      
      // Create a booking record in Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingReference,
          user_id: user.id,
          flight_id: id,
          passenger_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          phone_number: user.user_metadata?.phone || "",
          id_passport_number: "PENDING", // Will be filled in during payment
          passenger_count: passengerCount,
          total_amount: totalAmount,
          booking_status: 'unpaid',
          payment_status: 'pending',
          is_round_trip: tripType === 'roundTrip',
          special_requests: ""
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Show success message
      toast({
        title: "Booking Created",
        description: "Your booking has been created. Please complete payment to confirm.",
      });
      
      // Navigate to booking confirmation page
      navigate(`/booking/${id}/confirmation?bookingId=${data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Error",
        description: "Failed to create your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-flysafari-primary hover:underline font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Search Results
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-flysafari-dark">
                        {flight.departure_city} to {flight.arrival_city}
                      </h1>
                      <p className="text-gray-500">One way flight • {flight.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-2xl font-bold text-flysafari-primary">
                        {formatPrice(flight.price)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-semibold">
                        {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-gray-500">{flight.departure_city}</div>
                    </div>
                    
                    <div className="flex-1 mx-4">
                      <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-gray-300 border-dashed"></div>
                        <div className="absolute top-1/2 transform -translate-y-1/2 left-0">
                          <div className="w-3 h-3 rounded-full bg-flysafari-primary"></div>
                        </div>
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-0">
                          <div className="w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                        </div>
                        <div className="absolute top-1/2 transform -translate-y-1/2 left-1/2 -ml-4">
                          <Plane className="w-8 h-8 text-flysafari-primary" />
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <span className="text-sm font-medium bg-gray-100 rounded-full px-3 py-1">
                          {flight.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-xl font-semibold">
                        {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-gray-500">{flight.arrival_city}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Flight Details</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Airline Information</h3>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                          <Plane className="w-6 h-6 text-flysafari-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{flight.airline}</p>
                          <p className="text-sm text-gray-500">Flight {flight.flight_number}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-flysafari-primary mr-2" />
                          <span>
                            {new Date(flight.departure_time).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-flysafari-primary mr-2" />
                          <span>
                            Departure: {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-flysafari-secondary mr-2" />
                          <span>
                            Arrival: {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Flight Amenities</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="w-5 h-5 text-flysafari-primary mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Baggage Allowance</p>
                            <p className="text-sm text-gray-500">{flight.baggage_allowance}</p>
                          </div>
                        </div>
                        
                        {flight.amenities && flight.amenities.length > 0 && (
                          <div className="flex items-start">
                            <div className="w-5 h-5 text-flysafari-primary mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">In-flight Amenities</p>
                              <ul className="text-sm text-gray-500">
                                {flight.amenities.map((amenity, index) => (
                                  <li key={index}>{amenity}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {flight.aircraft && (
                          <div className="flex items-start">
                            <div className="w-5 h-5 text-flysafari-primary mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Aircraft</p>
                              <p className="text-sm text-gray-500">{flight.aircraft}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start">
                          <div className="w-5 h-5 text-flysafari-primary mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Available Seats</p>
                            <p className="text-sm text-gray-500">{flight.available_seats} seats available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                <div className="bg-flysafari-primary p-4 text-white">
                  <h2 className="text-lg font-semibold">Book This Flight</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="oneWay"
                          checked={tripType === 'oneWay'}
                          onChange={() => setTripType('oneWay')}
                          className="h-4 w-4 text-flysafari-primary focus:ring-flysafari-primary"
                        />
                        <span className="ml-2 text-sm">One Way</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="roundTrip"
                          checked={tripType === 'roundTrip'}
                          onChange={() => setTripType('roundTrip')}
                          className="h-4 w-4 text-flysafari-primary focus:ring-flysafari-primary"
                        />
                        <span className="ml-2 text-sm">Round Trip</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      id="departureDate"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full border-gray-300 rounded-md focus:ring-flysafari-primary focus:border-flysafari-primary"
                      required
                    />
                  </div>
                  
                  {tripType === 'roundTrip' && (
                    <div>
                      <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        id="returnDate"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full border-gray-300 rounded-md focus:ring-flysafari-primary focus:border-flysafari-primary"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="passengerCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Passengers
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))}
                        className="bg-gray-200 hover:bg-gray-300 rounded-l-md p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        id="passengerCount"
                        min="1"
                        max={flight.available_seats}
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Math.min(flight.available_seats, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="text-center w-16 border-gray-300 focus:ring-flysafari-primary focus:border-flysafari-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setPassengerCount(prev => Math.min(flight.available_seats, prev + 1))}
                        className="bg-gray-200 hover:bg-gray-300 rounded-r-md p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Base Fare ({passengerCount} passenger{passengerCount > 1 ? 's' : ''})</span>
                      <span>{formatPrice(flight.price * passengerCount)}</span>
                    </div>
                    
                    {tripType === 'roundTrip' && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Return Flight</span>
                        <span>{formatPrice(flight.price * passengerCount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-flysafari-primary">{formatPrice(calculateTotalPrice())}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBookNow}
                    disabled={isBooking || flight.available_seats < passengerCount}
                    className={`w-full btn btn-primary py-3 flex items-center justify-center ${
                      isBooking || flight.available_seats < passengerCount ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isBooking ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Processing...
                      </>
                    ) : flight.available_seats < passengerCount ? (
                      'Not Enough Seats'
                    ) : (
                      'Book Now'
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By clicking "Book Now", you agree to our terms and conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4 text-flysafari-primary">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold">Sign In Required</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Please sign in to your account to book this flight.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="btn btn-outline py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/sign-in');
                }}
                className="btn btn-primary py-2 px-4"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightDetails;
