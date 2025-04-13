
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Plane, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Users, 
  Info, 
  Luggage,
  Shield,
  AlertCircle
} from "lucide-react";

// Mock flight data
const mockFlights = [
  {
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
    seatsAvailable: 25,
    aircraft: "Boeing 737-800",
    amenities: ["Wi-Fi", "In-flight meals", "Entertainment"],
    baggageAllowance: "23kg checked, 7kg cabin",
    terminal: "Terminal 1A",
    gate: "Gate 5",
    status: "Scheduled"
  },
  {
    id: 2,
    airline: "Jambojet",
    flightNumber: "JM456",
    from: "Nairobi",
    to: "Kisumu",
    departureTime: "10:30 AM",
    arrivalTime: "11:30 AM",
    date: "2025-05-01",
    price: 9800,
    duration: "1h",
    seatsAvailable: 18,
    aircraft: "Bombardier Dash 8 Q400",
    amenities: ["Complimentary drinks"],
    baggageAllowance: "15kg checked, 7kg cabin",
    terminal: "Terminal 1B",
    gate: "Gate 3",
    status: "Scheduled"
  },
  {
    id: 3,
    airline: "Fly540",
    flightNumber: "FL789",
    from: "Mombasa",
    to: "Nairobi",
    departureTime: "02:15 PM",
    arrivalTime: "03:15 PM",
    date: "2025-05-01",
    price: 11200,
    duration: "1h",
    seatsAvailable: 12,
    aircraft: "ATR 72-500",
    amenities: ["Complimentary drinks"],
    baggageAllowance: "15kg checked, 5kg cabin",
    terminal: "Terminal 2",
    gate: "Gate 8",
    status: "Scheduled"
  },
  {
    id: 4,
    airline: "Safarilink",
    flightNumber: "SF101",
    from: "Nairobi",
    to: "Lamu",
    departureTime: "07:45 AM",
    arrivalTime: "09:15 AM",
    date: "2025-05-01",
    price: 18500,
    duration: "1h 30m",
    seatsAvailable: 8,
    aircraft: "Cessna Caravan",
    amenities: ["Scenic views"],
    baggageAllowance: "15kg checked, 5kg cabin",
    terminal: "Wilson Airport",
    gate: "Gate 2",
    status: "Scheduled"
  },
  {
    id: 5,
    airline: "Kenya Airways",
    flightNumber: "KQ321",
    from: "Kisumu",
    to: "Nairobi",
    departureTime: "05:00 PM",
    arrivalTime: "06:00 PM",
    date: "2025-05-01",
    price: 10200,
    duration: "1h",
    seatsAvailable: 15,
    aircraft: "Embraer 190",
    amenities: ["Wi-Fi", "In-flight meals"],
    baggageAllowance: "23kg checked, 7kg cabin",
    terminal: "Terminal 1A",
    gate: "Gate 7",
    status: "Scheduled"
  },
];

const FlightDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passengerCount, setPassengerCount] = useState(1);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundFlight = mockFlights.find(f => f.id.toString() === id);
      setFlight(foundFlight || null);
      setLoading(false);
    }, 500);
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header with airline info */}
              <div className="bg-flysafari-primary text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane size={20} />
                    <h1 className="text-xl font-bold">{flight.airline}</h1>
                  </div>
                  <span className="text-sm font-medium bg-white/20 py-1 px-3 rounded-full">
                    {flight.flightNumber}
                  </span>
                </div>
              </div>
              
              {/* Flight route and time */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center flex-1">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{flight.departureTime}</p>
                      <p className="text-gray-500">{flight.from}</p>
                    </div>
                    <div className="mx-6 flex flex-col items-center flex-1">
                      <div className="text-sm text-gray-500 mb-1">{flight.duration}</div>
                      <div className="w-full h-0.5 bg-gray-300 relative">
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                        <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{flight.status}</div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                      <p className="text-gray-500">{flight.to}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-flysafari-primary" />
                    <span>{flight.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-flysafari-primary" />
                    <span>{flight.seatsAvailable} seats available</span>
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
                    <p>{flight.aircraft}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Terminal & Gate</h3>
                    <p>{flight.terminal}, {flight.gate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Baggage Allowance</h3>
                    <p>{flight.baggageAllowance}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amenities</h3>
                    <p>{flight.amenities.join(", ")}</p>
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
              
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">{flight.from} to {flight.to}</h3>
                  <p className="text-sm text-gray-500">{flight.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-flysafari-primary">
                    {formatPrice(flight.price)}
                  </p>
                  <p className="text-xs text-gray-500">per passenger</p>
                </div>
              </div>
              
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
                  <span>{formatPrice(flight.price * passengerCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>{formatPrice(flight.price * passengerCount * 0.16)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
                  <span>Total</span>
                  <span className="text-flysafari-primary">
                    {formatPrice(flight.price * passengerCount * 1.16)}
                  </span>
                </div>
              </div>
              
              <Link 
                to={`/booking/${flight.id}?passengers=${passengerCount}`}
                className="btn btn-secondary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                Book Now
              </Link>
              
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
