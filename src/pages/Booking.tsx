import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  ArrowLeft
} from "lucide-react";

// Use the same mock flight data from FlightDetails
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
  // ...other flights from previous component
];

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passengerCount, setPassengerCount] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreeToTerms: false
  });
  
  useEffect(() => {
    // Get passenger count from URL
    const passengersParam = queryParams.get("passengers");
    if (passengersParam) {
      setPassengerCount(Number(passengersParam));
    }
    
    // Simulate API fetch
    setTimeout(() => {
      const foundFlight = mockFlights.find(f => f.id.toString() === id);
      setFlight(foundFlight || null);
      setLoading(false);
    }, 500);
  }, [id, queryParams]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const inputValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: inputValue
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would process the booking here
    console.log("Booking submitted:", { flight, passengerCount, formData });
    
    // For demo purposes, just navigate to the confirmation page
    navigate(`/booking/${id}/confirmation`);
  };
  
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
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to flight details
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-flysafari-primary text-white p-4">
                <h1 className="text-xl font-bold">Complete Your Booking</h1>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-semibold mb-4">Passenger Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="form-input pl-10 w-full"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="form-input pl-10 w-full"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input pl-10 w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="form-input pl-10 w-full"
                        placeholder="Enter your phone number"
                      />
                    </div>
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
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-secondary w-full py-3 text-base"
                >
                  Proceed to Payment
                </button>
              </form>
            </div>
          </div>
          
          {/* Booking summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Plane size={18} className="text-flysafari-primary" />
                    <span className="font-medium">{flight.airline}</span>
                  </div>
                  <span className="text-sm text-gray-500">{flight.flightNumber}</span>
                </div>
                
                <div className="flex items-center my-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{flight.departureTime}</p>
                    <p className="text-sm text-gray-500">{flight.from}</p>
                  </div>
                  <div className="mx-3 flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                    <div className="w-full h-0.5 bg-gray-300 relative">
                      <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                      <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{flight.arrivalTime}</p>
                    <p className="text-sm text-gray-500">{flight.to}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{flight.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{passengerCount} {passengerCount === 1 ? "Passenger" : "Passengers"}</span>
                  </div>
                </div>
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
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CreditCard size={16} className="text-flysafari-primary" />
                  Payment Options
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Secure payment via M-PESA, processed by Flutterwave.
                </p>
                <img 
                  src="https://cdn.filestackcontent.com/oEP1I38aTtyRlEUo0VkX" 
                  alt="M-PESA Logo" 
                  className="h-10 mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
