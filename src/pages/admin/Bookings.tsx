
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Plane, 
  User, 
  FilterX,
  CreditCard,
  Check,
  X,
  FileDown
} from "lucide-react";

// Mock bookings data
const mockBookings = [
  {
    id: "BK12345",
    customer: {
      name: "John Mwangi",
      email: "john@example.com",
      phone: "+254 700 123456"
    },
    flight: {
      id: 1,
      airline: "Kenya Airways",
      flightNumber: "KQ123",
      from: "Nairobi",
      to: "Mombasa",
      date: "2025-05-01",
      departureTime: "08:00 AM"
    },
    passengerCount: 1,
    totalAmount: 14500,
    paymentMethod: "M-PESA",
    paymentReference: "MPESA7890123",
    bookingDate: "2025-04-15",
    status: "Confirmed"
  },
  {
    id: "BK12346",
    customer: {
      name: "Aisha Omondi",
      email: "aisha@example.com",
      phone: "+254 700 234567"
    },
    flight: {
      id: 2,
      airline: "Jambojet",
      flightNumber: "JM456",
      from: "Nairobi",
      to: "Kisumu",
      date: "2025-05-02",
      departureTime: "10:30 AM"
    },
    passengerCount: 2,
    totalAmount: 22736,
    paymentMethod: "M-PESA",
    paymentReference: "MPESA7890124",
    bookingDate: "2025-04-14",
    status: "Confirmed"
  },
  {
    id: "BK12347",
    customer: {
      name: "David Kamau",
      email: "david@example.com",
      phone: "+254 700 345678"
    },
    flight: {
      id: 3,
      airline: "Fly540",
      flightNumber: "FL789",
      from: "Mombasa",
      to: "Nairobi",
      date: "2025-04-20",
      departureTime: "02:15 PM"
    },
    passengerCount: 1,
    totalAmount: 12992,
    paymentMethod: "M-PESA",
    paymentReference: "MPESA7890125",
    bookingDate: "2025-04-10",
    status: "Completed"
  },
  {
    id: "BK12348",
    customer: {
      name: "Faith Wanjiku",
      email: "faith@example.com",
      phone: "+254 700 456789"
    },
    flight: {
      id: 5,
      airline: "Kenya Airways",
      flightNumber: "KQ321",
      from: "Kisumu",
      to: "Nairobi",
      date: "2025-05-03",
      departureTime: "05:00 PM"
    },
    passengerCount: 1,
    totalAmount: 10200,
    paymentMethod: "M-PESA",
    paymentReference: "MPESA7890126",
    bookingDate: "2025-04-16",
    status: "Cancelled"
  },
  {
    id: "BK12349",
    customer: {
      name: "Samuel Njoroge",
      email: "samuel@example.com",
      phone: "+254 700 567890"
    },
    flight: {
      id: 4,
      airline: "Safarilink",
      flightNumber: "SF101",
      from: "Nairobi",
      to: "Lamu",
      date: "2025-05-04",
      departureTime: "07:45 AM"
    },
    passengerCount: 3,
    totalAmount: 55500,
    paymentMethod: "M-PESA",
    paymentReference: "MPESA7890127",
    bookingDate: "2025-04-17",
    status: "Confirmed"
  }
];

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 800);
  }, []);
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Toggle booking details
  const toggleBookingDetails = (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };
  
  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    if (status === "Confirmed") {
      return (
        <span className="flex items-center gap-1 text-green-700 bg-green-100 py-1 px-2 rounded text-xs font-medium">
          <Check size={12} />
          Confirmed
        </span>
      );
    } else if (status === "Cancelled") {
      return (
        <span className="flex items-center gap-1 text-red-700 bg-red-100 py-1 px-2 rounded text-xs font-medium">
          <X size={12} />
          Cancelled
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-blue-700 bg-blue-100 py-1 px-2 rounded text-xs font-medium">
          <Check size={12} />
          {status}
        </span>
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Manage Bookings</h1>
          <p className="text-gray-600">View and manage all customer bookings</p>
        </div>
        
        <button 
          className="btn btn-outline py-2 px-4 inline-flex items-center gap-2 self-start"
        >
          <FileDown size={16} />
          Export Bookings
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-full"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleBookingDetails(booking.id)}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-semibold text-lg">{booking.id}</h2>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <Plane size={16} className="text-flysafari-primary" />
                      <span className="font-medium">{booking.flight.airline} {booking.flight.flightNumber}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{booking.flight.date}, {booking.flight.departureTime}</span>
                      </div>
                      <span>
                        {booking.flight.from} to {booking.flight.to}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-between items-end">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        <span>{booking.customer.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {booking.passengerCount} {booking.passengerCount === 1 ? "passenger" : "passengers"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-bold text-flysafari-primary">
                        {formatPrice(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded details */}
              {expandedBooking === booking.id && (
                <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Customer Information</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <User size={14} className="text-gray-500 mt-1" />
                          <div>
                            <span className="font-medium">Name:</span> {booking.customer.name}
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mt-1">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          <div>
                            <span className="font-medium">Email:</span> {booking.customer.email}
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mt-1">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <div>
                            <span className="font-medium">Phone:</span> {booking.customer.phone}
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Information</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CreditCard size={14} className="text-gray-500 mt-1" />
                          <div>
                            <span className="font-medium">Method:</span> {booking.paymentMethod}
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mt-1">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <line x1="2" x2="22" y1="10" y2="10" />
                          </svg>
                          <div>
                            <span className="font-medium">Reference:</span> {booking.paymentReference}
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <Calendar size={14} className="text-gray-500 mt-1" />
                          <div>
                            <span className="font-medium">Booking Date:</span> {booking.bookingDate}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 gap-3">
                    <button className="btn btn-outline py-2 px-4 inline-flex items-center gap-2">
                      <FileDown size={16} />
                      Export Details
                    </button>
                    
                    {booking.status === "Confirmed" && (
                      <button className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 inline-flex items-center gap-2">
                        <X size={16} />
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
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FilterX size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "No bookings match your search criteria. Try a different search or filter."
              : "There are no bookings in the system yet."}
          </p>
          <div className="flex justify-center gap-4">
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="btn btn-outline py-2 px-4"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
