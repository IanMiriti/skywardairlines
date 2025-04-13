import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plane, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  Search,
  Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import { toast } from "@/hooks/use-toast";
import { Booking, Flight } from "@/utils/types";

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [cancellationId, setCancellationId] = useState<string | null>(null);
  const [cancellationConfirm, setCancellationConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState(false);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      setLoading(true);
      console.log("Fetching bookings for user:", user.id);
      
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (bookingsError) {
          throw bookingsError;
        }
        
        if (!bookingsData || bookingsData.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }
        
        const flightDetailsMap = new Map<string, Flight>();
        
        const flightIds = new Set<string>();
        bookingsData.forEach(booking => {
          if (booking.flight_id) flightIds.add(booking.flight_id);
          if (booking.return_flight_id) flightIds.add(booking.return_flight_id);
        });
        
        for (const flightId of flightIds) {
          const { data: flightData, error: flightError } = await supabase
            .from('flights')
            .select('*')
            .eq('id', flightId)
            .single();
            
          if (flightError) {
            console.error(`Error fetching flight ${flightId}:`, flightError);
            continue;
          }
          
          flightDetailsMap.set(flightId, flightData as Flight);
        }
        
        const fullBookings = bookingsData.map(booking => {
          return {
            ...booking,
            flight: booking.flight_id ? flightDetailsMap.get(booking.flight_id) || null : null,
            return_flight: booking.return_flight_id ? flightDetailsMap.get(booking.return_flight_id) || null : null
          } as Booking;
        });
        
        setBookings(fullBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchBookings();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);
  
  const toggleBookingDetails = (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setCancellationId(bookingId);
    setCancellationConfirm(true);
  };
  
  const confirmCancellation = async () => {
    if (!cancellationId) return;
    
    setCancellingBooking(true);
    
    try {
      const bookingToCancel = bookings.find(b => b.id === cancellationId);
      
      if (!bookingToCancel) {
        throw new Error("Booking not found");
      }
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancellationId);
      
      if (error) {
        throw error;
      }
      
      if (bookingToCancel.flight_id) {
        const { error: seatError } = await supabase
          .rpc('increment_available_seats', {
            flight_id: bookingToCancel.flight_id,
            seats_count: bookingToCancel.passenger_count
          }) as { error: any };
        
        if (seatError) {
          console.error("Error restoring flight seats:", seatError);
        }
      }
      
      if (bookingToCancel.is_round_trip && bookingToCancel.return_flight_id) {
        const { error: returnSeatError } = await supabase
          .rpc('increment_available_seats', {
            flight_id: bookingToCancel.return_flight_id,
            seats_count: bookingToCancel.passenger_count
          }) as { error: any };
        
        if (returnSeatError) {
          console.error("Error restoring return flight seats:", returnSeatError);
        }
      }
      
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === cancellationId 
            ? { ...booking, booking_status: 'cancelled' } 
            : booking
        )
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellationConfirm(false);
      setCancellationId(null);
      setCancellingBooking(false);
    }
  };
  
  const cancelCancellation = () => {
    setCancellationConfirm(false);
    setCancellationId(null);
  };
  
  const handlePayment = (bookingId: string) => {
    navigate(`/payment/${bookingId}`);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const filteredBookings = bookings.filter(booking => 
    booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight?.airline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight?.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight?.departure_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight?.arrival_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case "unpaid":
        return (
          <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            Unpaid
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            {status || "Pending"}
          </span>
        );
    }
  };

  const refreshBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const flightDetailsMap = new Map<string, Flight>();
      
      const flightIds = new Set<string>();
      bookingsData.forEach(booking => {
        if (booking.flight_id) flightIds.add(booking.flight_id);
        if (booking.return_flight_id) flightIds.add(booking.return_flight_id);
      });
      
      for (const flightId of flightIds) {
        const { data: flightData, error: flightError } = await supabase
          .from('flights')
          .select('*')
          .eq('id', flightId)
          .single();
          
        if (flightError) {
          console.error(`Error fetching flight ${flightId}:`, flightError);
          continue;
        }
        
        flightDetailsMap.set(flightId, flightData as Flight);
      }
      
      const fullBookings = bookingsData.map(booking => {
        return {
          ...booking,
          flight: booking.flight_id ? flightDetailsMap.get(booking.flight_id) || null : null,
          return_flight: booking.return_flight_id ? flightDetailsMap.get(booking.return_flight_id) || null : null
        } as Booking;
      });
      
      setBookings(fullBookings);
      
      toast({
        title: "Refreshed",
        description: "Your bookings have been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Plane size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to view your bookings.
          </p>
          <Link to="/sign-in" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-flysafari-dark">My Bookings</h1>
            <button 
              className="text-flysafari-primary hover:text-flysafari-primary/80 flex items-center gap-1"
              onClick={refreshBookings}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search bookings by ID, airline, flight number, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-flysafari-primary focus:border-flysafari-primary"
              />
            </div>
          </div>
          
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden card-hover"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="font-semibold text-lg">{booking.booking_reference}</h2>
                          {getStatusBadge(booking.booking_status)}
                        </div>
                        
                        {booking.flight && (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <Plane size={16} className="text-flysafari-primary" />
                              <span className="font-medium text-gray-700">{booking.flight.airline}</span>
                              <span className="text-sm text-gray-500">{booking.flight.flight_number}</span>
                            </div>
                            
                            <div className="flex items-center my-2">
                              <span className="font-medium">{booking.flight.departure_city}</span>
                              <ArrowRight size={14} className="mx-2 text-gray-400" />
                              <span className="font-medium">{booking.flight.arrival_city}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date(booking.flight.departure_time).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{new Date(booking.flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-row md:flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-flysafari-primary">
                            {formatPrice(booking.total_amount)}
                          </p>
                          {booking.booking_status === "unpaid" && (
                            <span className="text-xs text-yellow-600 font-medium">Payment Required</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => toggleBookingDetails(booking.id)}
                          className="flex items-center gap-1 text-flysafari-secondary hover:text-flysafari-secondary/80"
                        >
                          {expandedBooking === booking.id ? (
                            <>
                              <ChevronUp size={16} />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              <span>View Details</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedBooking === booking.id && booking.flight && (
                    <div className="px-4 md:px-6 pb-6 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Flight Details</h3>
                          <div className="flex items-center my-2">
                            <div className="flex flex-col items-center">
                              <p className="font-semibold">{new Date(booking.flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-xs text-gray-500">{booking.flight.departure_city}</p>
                            </div>
                            <div className="mx-3 flex flex-col items-center flex-1">
                              <div className="text-xs text-gray-500 mb-1">{booking.flight.duration}</div>
                              <div className="w-full h-0.5 bg-gray-300 relative">
                                <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                                <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-semibold">{new Date(booking.flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <p className="text-xs text-gray-500">{booking.flight.arrival_city}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Booking Information</h3>
                          <ul className="space-y-1 text-sm">
                            <li className="flex justify-between">
                              <span className="text-gray-600">Booking Date:</span>
                              <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Passengers:</span>
                              <span>{booking.passenger_count}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span>{booking.booking_status}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Payment Status:</span>
                              <span>{booking.payment_status || "Pending"}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        {booking.booking_status !== "cancelled" && (
                          <Link
                            to={`/booking/${booking.flight_id}/confirmation?bookingId=${booking.id}`}
                            className="bg-safari-sky hover:bg-safari-sky/90 text-white py-2 px-4 rounded flex-1 text-center transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={16} />
                            View Ticket
                          </Link>
                        )}
                        
                        {booking.booking_status === "unpaid" && (
                          <button
                            onClick={() => handlePayment(booking.id)}
                            className="bg-safari-kente hover:bg-safari-kente/90 text-white py-2 px-4 rounded flex-1 text-center transition flex items-center justify-center gap-2 animate-pulse"
                          >
                            <Smartphone size={16} />
                            Complete Payment
                          </button>
                        )}
                        
                        {(booking.booking_status === "confirmed" || booking.booking_status === "unpaid") && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="border border-red-300 text-red-500 bg-white hover:bg-red-50 py-2 px-4 rounded flex-1 text-center transition flex items-center justify-center gap-1"
                          >
                            <XCircle size={16} />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Plane size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 
                  "No bookings match your search criteria. Try a different search term." : 
                  "You haven't made any bookings yet. Start by searching for flights and make your first booking."}
              </p>
              {searchTerm ? (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="btn btn-outline"
                >
                  Clear Search
                </button>
              ) : (
                <Link to="/flights" className="btn btn-primary">
                  Search Flights
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {cancellationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelCancellation}
                className="border border-gray-300 bg-white hover:bg-gray-50 py-2 px-4 rounded"
                disabled={cancellingBooking}
              >
                No, Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center gap-2"
                disabled={cancellingBooking}
              >
                {cancellingBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Yes, Cancel Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
