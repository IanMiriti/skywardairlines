
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Booking, Flight } from "@/utils/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Search,
  Calendar,
  Users,
  Plane,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Filter
} from "lucide-react";

interface BookingsListProps {
  showFilters?: boolean;
}

const BookingsList = ({ showFilters = true }: BookingsListProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    
    try {
      // First get all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (bookingsError) {
        throw bookingsError;
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }
      
      // Create a map to store flight details for each flight_id
      const flightDetailsMap = new Map<string, Flight>();
      
      // Get unique flight IDs (both outbound and return)
      const flightIds = new Set<string>();
      bookingsData.forEach(booking => {
        if (booking.flight_id) flightIds.add(booking.flight_id);
        if (booking.return_flight_id) flightIds.add(booking.return_flight_id);
      });
      
      // Fetch flight details for all flight IDs
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
      
      // Combine booking data with flight details
      const fullBookings = bookingsData.map(booking => {
        return {
          ...booking,
          flight: booking.flight_id ? flightDetailsMap.get(booking.flight_id) || null : null,
          return_flight: booking.return_flight_id ? flightDetailsMap.get(booking.return_flight_id) || null : null
        } as Booking;
      });
      
      setBookings(fullBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Apply filters to bookings
  const filteredBookings = bookings.filter(booking => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      booking.booking_reference.toLowerCase().includes(searchLower) ||
      booking.passenger_name.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.phone_number.toLowerCase().includes(searchLower) ||
      (booking.flight?.flight_number.toLowerCase().includes(searchLower) || false);
      
    if (!matchesSearch) return false;
    
    // Status filter
    if (statusFilter !== 'all' && booking.booking_status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const bookingDate = new Date(booking.created_at);
      
      if (dateFilter === 'today') {
        return (
          bookingDate.getDate() === today.getDate() &&
          bookingDate.getMonth() === today.getMonth() &&
          bookingDate.getFullYear() === today.getFullYear()
        );
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return bookingDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return bookingDate >= oneMonthAgo;
      }
    }
    
    return true;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Plane className="text-flysafari-primary" size={24} />
          <h2 className="text-xl font-semibold">Bookings</h2>
          <span className="text-sm text-gray-500 ml-2">({bookings.length} total)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 pr-4 py-2 w-full sm:w-64"
            />
          </div>
          
          <button
            onClick={fetchBookings}
            className="btn btn-outline p-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-flysafari-primary"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <Plane className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">No bookings found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Ref</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium text-flysafari-primary">{booking.booking_reference}</div>
                    <div className="text-xs text-gray-500">{formatDate(booking.created_at)}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>{booking.passenger_name}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                  </td>
                  <td className="p-3">
                    {booking.flight ? (
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{booking.flight.flight_number}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {booking.flight.airline}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.flight.departure_city} → {booking.flight.arrival_city}
                        </div>
                        {booking.is_round_trip && booking.return_flight && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span>Return:</span>
                            <span>{booking.return_flight.flight_number}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Flight details not available</span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {booking.flight ? (
                      <div>
                        <div>{formatDate(booking.flight.departure_time)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.flight.departure_time)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{formatPrice(booking.total_amount)}</div>
                    <div className="text-xs text-gray-500">
                      {booking.passenger_count} {booking.passenger_count === 1 ? 'passenger' : 'passengers'}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(booking.booking_status)}`}>
                      {booking.booking_status === 'confirmed' && <CheckCircle size={12} className="mr-1" />}
                      {booking.booking_status === 'pending' && <Clock size={12} className="mr-1" />}
                      {booking.booking_status === 'cancelled' && <XCircle size={12} className="mr-1" />}
                      {booking.booking_status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {booking.payment_method}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
