
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  Users, 
  Plane,
  Send
} from "lucide-react";

// Mock booking data
const mockBooking = {
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
    price: 12500,
    duration: "1h",
    terminal: "Terminal 1A",
    gate: "Gate 5",
  },
  passengerCount: 1,
  totalAmount: 14500,
  paymentMethod: "M-PESA",
  paymentReference: "MPESA7890123",
  bookingDate: "2025-04-15",
  status: "Confirmed",
};

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setBooking(mockBooking);
      setLoading(false);
    }, 800);
  }, [id]);
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
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
        <div className="max-w-3xl mx-auto">
          {/* Success message */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-green-500 text-white p-6 text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3" />
              <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
              <p>Your booking has been successfully confirmed and paid.</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Booking Reference</h2>
                  <p className="text-2xl font-bold text-flysafari-primary">{booking.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline flex items-center gap-2 py-2">
                    <Download size={16} />
                    Download
                  </button>
                  <button className="btn btn-outline flex items-center gap-2 py-2">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6 my-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Plane size={18} className="text-flysafari-primary" />
                      <span className="font-medium">{booking.flight.airline}</span>
                    </div>
                    <span className="text-sm text-gray-500">{booking.flight.flightNumber}</span>
                  </div>
                  
                  <div className="flex items-center my-3">
                    <div className="text-center">
                      <p className="text-lg font-bold">{booking.flight.departureTime}</p>
                      <p className="text-sm text-gray-500">{booking.flight.from}</p>
                    </div>
                    <div className="mx-3 flex flex-col items-center flex-1">
                      <div className="text-xs text-gray-500 mb-1">{booking.flight.duration}</div>
                      <div className="w-full h-0.5 bg-gray-300 relative">
                        <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                        <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{booking.flight.arrivalTime}</p>
                      <p className="text-sm text-gray-500">{booking.flight.to}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{booking.flight.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{booking.passengerCount} {booking.passengerCount === 1 ? "Passenger" : "Passengers"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Duration: {booking.flight.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Terminal & Gate</h3>
                    <p>{booking.flight.terminal}, {booking.flight.gate}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Booking Date</h3>
                    <p>{booking.bookingDate}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Payment Method</h3>
                    <p>{booking.paymentMethod}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 mb-1">Payment Reference</h3>
                    <p>{booking.paymentReference}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold">Total Amount Paid</span>
                <span className="text-xl font-bold text-flysafari-primary">
                  {formatPrice(booking.totalAmount)}
                </span>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3 mb-6">
                <Send size={20} className="text-flysafari-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-flysafari-primary">Booking Confirmation Sent</h3>
                  <p className="text-sm mt-1 text-gray-600">
                    We've sent a confirmation email with your booking details.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/my-bookings"
                  className="btn btn-primary py-2 px-4 text-center flex-1"
                >
                  View All Bookings
                </Link>
                <Link
                  to="/"
                  className="btn btn-outline py-2 px-4 text-center flex-1"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
