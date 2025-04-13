
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { 
  ArrowRight, 
  Search, 
  Filter, 
  X, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Booking interface
interface Booking {
  id: string;
  booking_reference: string;
  passenger_name: string;
  email: string;
  phone_number: string;
  passenger_count: number;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  created_at: string;
  is_round_trip: boolean;
  flight_id: string;
  return_flight_id?: string | null;
  flight: {
    flight_number: string;
    airline: string;
    departure_city: string;
    arrival_city: string;
    departure_time: string;
  } | null;
  return_flight?: {
    flight_number: string;
    airline: string;
    departure_city: string;
    arrival_city: string;
    departure_time: string;
  } | null;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get all bookings
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
        
        // Create a list of processed bookings with flight details
        const processedBookings: Booking[] = [];
        
        // Process each booking to get flight details
        for (const booking of bookingsData) {
          // Get flight details
          let flightDetails = null;
          if (booking.flight_id) {
            const { data: flightData, error: flightError } = await supabase
              .from('flights')
              .select('flight_number, airline, departure_city, arrival_city, departure_time')
              .eq('id', booking.flight_id)
              .single();
              
            if (!flightError && flightData) {
              flightDetails = flightData;
            }
          }
          
          // Get return flight details if exists
          let returnFlightDetails = null;
          if (booking.return_flight_id) {
            const { data: returnFlightData, error: returnFlightError } = await supabase
              .from('flights')
              .select('flight_number, airline, departure_city, arrival_city, departure_time')
              .eq('id', booking.return_flight_id)
              .single();
              
            if (!returnFlightError && returnFlightData) {
              returnFlightDetails = returnFlightData;
            }
          }
          
          // Add the processed booking with flight details
          processedBookings.push({
            ...booking,
            flight: flightDetails,
            return_flight: returnFlightDetails
          } as Booking);
        }
        
        setBookings(processedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
    });
  };
  
  // Apply filters to bookings
  const filteredBookings = bookings.filter(booking => {
    // Search filter (reference, name, email, phone)
    const searchMatch = !filters.search || 
      booking.booking_reference.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.passenger_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.phone_number.includes(filters.search);
    
    // Status filter
    const statusMatch = !filters.status || booking.booking_status === filters.status;
    
    // Payment status filter
    const paymentMatch = !filters.paymentStatus || booking.payment_status === filters.paymentStatus;
    
    // Date range filter
    let dateMatch = true;
    if (filters.startDate) {
      const bookingDate = new Date(booking.created_at);
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      dateMatch = dateMatch && bookingDate >= startDate;
    }
    
    if (filters.endDate) {
      const bookingDate = new Date(booking.created_at);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && bookingDate <= endDate;
    }
    
    return searchMatch && statusMatch && paymentMatch && dateMatch;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy - h:mm a');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  // Format flight date for display
  const formatFlightDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Refresh bookings
  const refreshBookings = async () => {
    setLoading(true);
    
    try {
      // First, get all bookings
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
      
      // Create a list of processed bookings with flight details
      const processedBookings: Booking[] = [];
      
      // Process each booking to get flight details
      for (const booking of bookingsData) {
        // Get flight details
        let flightDetails = null;
        if (booking.flight_id) {
          const { data: flightData, error: flightError } = await supabase
            .from('flights')
            .select('flight_number, airline, departure_city, arrival_city, departure_time')
            .eq('id', booking.flight_id)
            .single();
            
          if (!flightError && flightData) {
            flightDetails = flightData;
          }
        }
        
        // Get return flight details if exists
        let returnFlightDetails = null;
        if (booking.return_flight_id) {
          const { data: returnFlightData, error: returnFlightError } = await supabase
            .from('flights')
            .select('flight_number, airline, departure_city, arrival_city, departure_time')
            .eq('id', booking.return_flight_id)
            .single();
            
          if (!returnFlightError && returnFlightData) {
            returnFlightDetails = returnFlightData;
          }
        }
        
        // Add the processed booking with flight details
        processedBookings.push({
          ...booking,
          flight: flightDetails,
          return_flight: returnFlightDetails
        } as Booking);
      }
      
      setBookings(processedBookings);
      toast({
        title: "Success",
        description: "Bookings refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing bookings:', error);
      toast({
        title: "Error",
        description: "Failed to refresh bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
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
  
  // Get payment status badge color
  const getPaymentBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        
        <button
          onClick={refreshBookings}
          className="btn btn-outline flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Search input */}
          <div className="relative w-full md:w-auto flex-grow md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by reference, name, email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          {/* Filter toggle button (mobile) */}
          <button
            className="md:hidden btn btn-outline flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          {/* Desktop filters */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            <select
              className="form-select border border-gray-300 rounded-lg py-2 pl-3 pr-8"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="form-select border border-gray-300 rounded-lg py-2 pl-3 pr-8"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  placeholder="From"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <span className="text-gray-500">to</span>
              <input
                type="date"
                placeholder="To"
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            
            {(filters.search || filters.status || filters.paymentStatus || filters.startDate || filters.endDate) && (
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile filters */}
        {showFilters && (
          <div className="md:hidden space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Booking Status</label>
                <select
                  className="form-select border border-gray-300 rounded-lg py-2 pl-3 pr-8 w-full"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Payment Status</label>
                <select
                  className="form-select border border-gray-300 rounded-lg py-2 pl-3 pr-8 w-full"
                  name="paymentStatus"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">All Payments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  className="form-input border border-gray-300 rounded-lg py-2 px-3 w-full"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  className="form-input border border-gray-300 rounded-lg py-2 px-3 w-full"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            {(filters.search || filters.status || filters.paymentStatus || filters.startDate || filters.endDate) && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bookings list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-flysafari-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Bookings</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshBookings}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.paymentStatus || filters.startDate || filters.endDate ? 
                "No bookings match your filter criteria. Try adjusting your filters." : 
                "There are no bookings in the system yet."}
            </p>
            {(filters.search || filters.status || filters.paymentStatus || filters.startDate || filters.endDate) && (
              <button
                onClick={clearFilters}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flight Details
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div>{booking.booking_reference}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.is_round_trip ? (
                          <span className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Round Trip
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            One Way
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{booking.passenger_name}</div>
                      <div className="text-xs text-gray-500">{booking.email}</div>
                      <div className="text-xs text-gray-500">{booking.phone_number}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.passenger_count} {booking.passenger_count === 1 ? 'passenger' : 'passengers'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.flight && (
                        <div className="mb-2">
                          <div className="text-sm font-medium">
                            {booking.flight.departure_city} to {booking.flight.arrival_city}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{booking.flight.airline}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.flight.flight_number}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFlightDate(booking.flight.departure_time)}
                          </div>
                        </div>
                      )}
                      
                      {booking.return_flight && (
                        <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                          <div className="text-sm font-medium">
                            {booking.return_flight.departure_city} to {booking.return_flight.arrival_city}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{booking.return_flight.airline}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.return_flight.flight_number}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFlightDate(booking.return_flight.departure_time)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} />
                        {formatDate(booking.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatPrice(booking.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center justify-center ${getStatusBadgeClass(booking.booking_status)}`}>
                          {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center justify-center ${getPaymentBadgeClass(booking.payment_status)}`}>
                          Payment: {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
