import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Search 
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

// Mock bookings data - we'll pretend this comes from Supabase
// In a real app, this would be fetched from the database
const mockBookings = [
  {
    id: "BK12345",
    flight: {
      id: 1,
      airline: "Kenya Airways",
      flightNumber: "KQ123",
      from: "Nairobi",
      to: "Mombasa",
      departureTime: "08:00 AM",
      arrivalTime: "09:00 AM",
      date: "2025-05-01",
      duration: "1h",
    },
    passengerCount: 1,
    totalAmount: 14500,
    bookingDate: "2025-04-15",
    status: "Confirmed",
    cancellable: true,
  },
  {
    id: "BK12346",
    flight: {
      id: 2,
      airline: "Jambojet",
      flightNumber: "JM456",
      from: "Nairobi",
      to: "Kisumu",
      departureTime: "10:30 AM",
      arrivalTime: "11:30 AM",
      date: "2025-06-15",
      duration: "1h",
    },
    passengerCount: 2,
    totalAmount: 22736,
    bookingDate: "2025-04-14",
    status: "Confirmed",
    cancellable: true,
  },
  {
    id: "BK12347",
    flight: {
      id: 3,
      airline: "Fly540",
      flightNumber: "FL789",
      from: "Mombasa",
      to: "Nairobi",
      departureTime: "02:15 PM",
      arrivalTime: "03:15 PM",
      date: "2025-04-20",
      duration: "1h",
    },
    passengerCount: 1,
    totalAmount: 12992,
    bookingDate: "2025-04-10",
    status: "Completed",
    cancellable: false,
  },
];

const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [cancellationId, setCancellationId] = useState<string | null>(null);
  const [cancellationConfirm, setCancellationConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      
      // In a real app, this would be a Supabase query
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .select('*, flight:flights(*)')
      //   .eq('user_id', user?.id);
      
      // Simulate API fetch with the mock data
      setTimeout(() => {
        setBookings(mockBookings);
        setLoading(false);
      }, 800);
    };
    
    if (user) {
      fetchBookings();
    }
  }, [user]);
  
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
    // In a real app, you would make an API call to cancel the booking
    // For this mock, we'll update the local state
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === cancellationId 
          ? { ...booking, status: "Cancelled", cancellable: false } 
          : booking
      )
    );
    
    setCancellationConfirm(false);
    setCancellationId(null);
  };
  
  const cancelCancellation = () => {
    setCancellationConfirm(false);
    setCancellationId(null);
  };
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => 
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      case "Completed":
        return (
          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            {status}
          </span>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
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
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 500);
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          
          {/* Search Box */}
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
                  {/* Booking summary */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="font-semibold text-lg">{booking.id}</h2>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <Plane size={16} className="text-flysafari-primary" />
                          <span className="font-medium text-gray-700">{booking.flight.airline}</span>
                          <span className="text-sm text-gray-500">{booking.flight.flightNumber}</span>
                        </div>
                        
                        <div className="flex items-center my-2">
                          <span className="font-medium">{booking.flight.from}</span>
                          <ArrowRight size={14} className="mx-2 text-gray-400" />
                          <span className="font-medium">{booking.flight.to}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{booking.flight.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{booking.flight.departureTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-flysafari-primary">
                            {formatPrice(booking.totalAmount)}
                          </p>
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
                  
                  {/* Expanded details */}
                  {expandedBooking === booking.id && (
                    <div className="px-4 md:px-6 pb-6 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Flight Details</h3>
                          <div className="flex items-center my-2">
                            <div className="flex flex-col items-center">
                              <p className="font-semibold">{booking.flight.departureTime}</p>
                              <p className="text-xs text-gray-500">{booking.flight.from}</p>
                            </div>
                            <div className="mx-3 flex flex-col items-center flex-1">
                              <div className="text-xs text-gray-500 mb-1">{booking.flight.duration}</div>
                              <div className="w-full h-0.5 bg-gray-300 relative">
                                <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                                <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-semibold">{booking.flight.arrivalTime}</p>
                              <p className="text-xs text-gray-500">{booking.flight.to}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Booking Information</h3>
                          <ul className="space-y-1 text-sm">
                            <li className="flex justify-between">
                              <span className="text-gray-600">Booking Date:</span>
                              <span>{booking.bookingDate}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Passengers:</span>
                              <span>{booking.passengerCount}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span>{booking.status}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Link
                          to={`/booking/${booking.flight.id}/confirmation`}
                          className="btn btn-primary py-2 flex-1 text-center"
                        >
                          View Ticket
                        </Link>
                        {booking.status === "Confirmed" && booking.cancellable && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="btn btn-outline py-2 flex-1 text-red-500 border-red-200 hover:bg-red-50"
                          >
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
      
      {/* Cancellation Confirmation Modal */}
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
                className="btn btn-outline py-2 px-4"
              >
                No, Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
