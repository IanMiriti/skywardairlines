
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { 
  Plane, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Users, 
  Info, 
  Luggage,
  Shield,
  AlertCircle,
  ArrowLeftRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Flight interface
interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  duration: string;
  available_seats: number;
  baggage_allowance: string;
  aircraft?: string;
  amenities?: string[];
  terminal?: string;
  gate?: string;
  status?: string;
}

const FlightDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnFlightId, setReturnFlightId] = useState<string | null>(queryParams.get('returnFlightId'));
  const [passengerCount, setPassengerCount] = useState(Number(queryParams.get('passengers')) || 1);
  const [tripType] = useState(queryParams.get('tripType') || 'oneWay');
  
  useEffect(() => {
    const fetchFlightDetails = async () => {
      setLoading(true);
      
      try {
        // Fetch the main flight
        const { data, error } = await supabase
          .from('flights')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setFlight(data);
        
        // If it's a round trip and we have a return flight ID, fetch that too
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
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Time parsing error:', e);
      return dateString;
    }
  };
  
  // Calculate total price
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
  
  // Calculate taxes
  const calculateTaxes = () => {
    return calculateTotalPrice() * 0.16; // 16% tax
  };
  
  // Grand total
  const calculateGrandTotal = () => {
    return calculateTotalPrice() + calculateTaxes();
  };
  
  // Handle booking
  const handleBookNow = () => {
    // Set return flight ID in query params
    const bookingParams = new URLSearchParams();
    bookingParams.append('passengers', passengerCount.toString());
    bookingParams.append('tripType', tripType);
    
    if (tripType === 'roundTrip' && returnFlight) {
      bookingParams.append('returnFlightId', returnFlight.id);
    }
    
    navigate(`/booking/${id}?${bookingParams.toString()}`);
  };
  
  // Handle selecting return flight
  const handleSelectReturnFlight = () => {
    if (tripType === 'roundTrip') {
      // Navigate to return flights
      navigate(`/flights?from=${flight?.arrival_city}&to=${flight?.departure_city}&departureDate=${queryParams.get('returnDate')}&returnDate=${queryParams.get('departureDate')}&passengers=${passengerCount}&tripType=${tripType}&outboundFlightId=${id}`);
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
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Flight Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the flight you're looking for. It may have been removed or the ID is incorrect.
          </p>
          <Link to="/flights" className="btn btn-primary">
            Back to Flights
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to flights
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight details card */}
          <div className="lg:col-span-2">
            {/* Trip type badge */}
            {tripType === 'roundTrip' && (
              <div className="mb-4 inline-flex items-center gap-2 bg-flysafari-primary/10 text-flysafari-primary py-1 px-3 rounded-full text-sm">
                <ArrowLeftRight size={16} />
                <span>Round Trip</span>
              </div>
            )}
            
            {/* Outbound flight */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Header with airline info */}
              <div className="bg-flysafari-primary text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane size={20} />
                    <h1 className="text-xl font-bold">
                      {tripType === 'roundTrip' ? 'Outbound Flight' : 'Flight Details'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-white/20 py-1 px-3 rounded-full">
                      {flight.airline}
                    </span>
                    <span className="text-sm font-medium bg-white/20 py-1 px-3 rounded-full">
                      {flight.flight_number}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Flight route and time */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center flex-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatTime(flight.departure_time)}</p>
                      <p className="text-gray-500">{flight.departure_city}</p>
                    </div>
                    <div className="mx-6 flex flex-col items-center flex-1">
                      <div className="text-sm text-gray-500 mb-1">{flight.duration}</div>
                      <div className="w-full h-0.5 bg-gray-300 relative">
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                        <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{flight.status || 'Scheduled'}</div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatTime(flight.arrival_time)}</p>
                      <p className="text-gray-500">{flight.arrival_city}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-flysafari-primary" />
                    <span>{formatDate(flight.departure_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-flysafari-primary" />
                    <span>{flight.available_seats} seats available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-flysafari-primary" />
                    <span>Duration: {flight.duration}</span>
                  </div>
                </div>
              </div>
              
              {/* Flight details */}
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Flight Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Aircraft</h3>
                    <p>{flight.aircraft || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Terminal & Gate</h3>
                    <p>{flight.terminal || 'TBD'}, {flight.gate || 'TBD'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Baggage Allowance</h3>
                    <p>{flight.baggage_allowance}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                    <p>{flight.amenities?.join(", ") || 'Standard'}</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md flex items-start gap-3">
                  <Info size={20} className="text-flysafari-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-flysafari-primary">Important Information</h3>
                    <p className="text-sm mt-1 text-gray-600">
                      Passengers should arrive at the airport at least 2 hours before the scheduled departure time for domestic flights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Return flight (if round trip) */}
            {tripType === 'roundTrip' && (
              <>
                {returnFlight ? (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    {/* Header with airline info */}
                    <div className="bg-flysafari-secondary text-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plane size={20} />
                          <h1 className="text-xl font-bold">Return Flight</h1>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium bg-white/20 py-1 px-3 rounded-full">
                            {returnFlight.airline}
                          </span>
                          <span className="text-sm font-medium bg-white/20 py-1 px-3 rounded-full">
                            {returnFlight.flight_number}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flight route and time */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center flex-1">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatTime(returnFlight.departure_time)}</p>
                            <p className="text-gray-500">{returnFlight.departure_city}</p>
                          </div>
                          <div className="mx-6 flex flex-col items-center flex-1">
                            <div className="text-sm text-gray-500 mb-1">{returnFlight.duration}</div>
                            <div className="w-full h-0.5 bg-gray-300 relative">
                              <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                              <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{returnFlight.status || 'Scheduled'}</div>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatTime(returnFlight.arrival_time)}</p>
                            <p className="text-gray-500">{returnFlight.arrival_city}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-flysafari-secondary" />
                          <span>{formatDate(returnFlight.departure_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-flysafari-secondary" />
                          <span>{returnFlight.available_seats} seats available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-flysafari-secondary" />
                          <span>Duration: {returnFlight.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flight details */}
                    <div className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Flight Details</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Aircraft</h3>
                          <p>{returnFlight.aircraft || 'Not specified'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Terminal & Gate</h3>
                          <p>{returnFlight.terminal || 'TBD'}, {returnFlight.gate || 'TBD'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Baggage Allowance</h3>
                          <p>{returnFlight.baggage_allowance}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                          <p>{returnFlight.amenities?.join(", ") || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <Plane size={24} className="text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Return Flight Not Selected</h3>
                        <p className="text-gray-600 mb-4">You haven't selected a return flight yet.</p>
                        <button 
                          onClick={handleSelectReturnFlight}
                          className="btn bg-flysafari-secondary hover:bg-flysafari-secondary/90 text-white"
                        >
                          Select Return Flight
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Cancellation Policy */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield size={18} className="text-flysafari-primary" />
                Cancellation Policy
              </h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Free cancellation up to 24 hours before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>50% refund for cancellations between 24 and 12 hours before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>No refund for cancellations less than 12 hours before departure</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {/* Outbound flight summary */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">{flight.departure_city} to {flight.arrival_city}</h3>
                  <p className="text-sm text-gray-500">{formatDate(flight.departure_time)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-flysafari-primary">
                    {formatPrice(flight.price)}
                  </p>
                  <p className="text-xs text-gray-500">per passenger</p>
                </div>
              </div>
              
              {/* Return flight summary (if any) */}
              {tripType === 'roundTrip' && returnFlight && (
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium">{returnFlight.departure_city} to {returnFlight.arrival_city}</h3>
                    <p className="text-sm text-gray-500">{formatDate(returnFlight.departure_time)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-flysafari-secondary">
                      {formatPrice(returnFlight.price)}
                    </p>
                    <p className="text-xs text-gray-500">per passenger</p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="form-input w-full"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Passenger" : "Passengers"}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Flight Price ({passengerCount} {passengerCount === 1 ? "passenger" : "passengers"})</span>
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
              
              {/* Booking CTA */}
              {tripType === 'roundTrip' && !returnFlight ? (
                <button 
                  onClick={handleSelectReturnFlight}
                  className="btn btn-secondary w-full py-3 text-base flex items-center justify-center gap-2"
                >
                  Select Return Flight
                </button>
              ) : (
                <button 
                  onClick={handleBookNow}
                  className="btn btn-secondary w-full py-3 text-base flex items-center justify-center gap-2"
                >
                  Book Now
                </button>
              )}
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Luggage size={14} />
                <span>Includes standard baggage allowance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
