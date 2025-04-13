import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Plane, 
  Save, 
  Trash2, 
  AlertCircle 
} from "lucide-react";

// Mock flights data
const mockFlights = [
  {
    id: 1,
    airline: "Kenya Airways",
    flightNumber: "KQ123",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "08:00",
    arrivalTime: "09:00",
    date: "2025-05-01",
    price: 12500,
    seatsTotal: 180,
    seatsAvailable: 25,
    aircraft: "Boeing 737-800",
    terminal: "Terminal 1A",
    gate: "Gate 5",
    status: "Active"
  },
  // ...other flights
];

// Available destinations
const destinations = [
  "Nairobi", 
  "Mombasa", 
  "Kisumu", 
  "Eldoret", 
  "Malindi", 
  "Lamu", 
  "Ukunda"
];

// Available airlines
const airlines = [
  "Kenya Airways",
  "Jambojet",
  "Fly540",
  "Safarilink",
  "AirKenya"
];

const AdminEditFlight = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewFlight = id === "new";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [flightData, setFlightData] = useState({
    airline: "",
    flightNumber: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    date: "",
    price: "",
    seatsTotal: "",
    seatsAvailable: "",
    aircraft: "",
    terminal: "",
    gate: "",
    status: "Active"
  });
  
  useEffect(() => {
    if (isNewFlight) {
      // Set default values for new flight
      setFlightData({
        airline: "Kenya Airways",
        flightNumber: "",
        from: "Nairobi",
        to: "",
        departureTime: "",
        arrivalTime: "",
        date: "",
        price: "",
        seatsTotal: "180",
        seatsAvailable: "",
        aircraft: "",
        terminal: "",
        gate: "",
        status: "Active"
      });
      setLoading(false);
    } else {
      // Fetch flight data
      setTimeout(() => {
        const flight = mockFlights.find(f => f.id.toString() === id);
        if (flight) {
          setFlightData({
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            from: flight.from,
            to: flight.to,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            date: flight.date,
            price: flight.price.toString(),
            seatsTotal: "180",
            seatsAvailable: flight.seatsAvailable.toString(),
            aircraft: flight.aircraft,
            terminal: flight.terminal,
            gate: flight.gate,
            status: flight.status
          });
        }
        setLoading(false);
      }, 800);
    }
  }, [id, isNewFlight]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFlightData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form
    if (
      !flightData.airline ||
      !flightData.flightNumber ||
      !flightData.from ||
      !flightData.to ||
      !flightData.departureTime ||
      !flightData.arrivalTime ||
      !flightData.date ||
      !flightData.price ||
      !flightData.seatsTotal ||
      !flightData.seatsAvailable
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    
    if (flightData.from === flightData.to) {
      setFormError("Departure and destination cannot be the same.");
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      // Navigate back to flights list
      navigate("/admin/flights");
    }, 1000);
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
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-3 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to flights
        </button>
        
        <h1 className="text-2xl font-bold text-flysafari-dark">
          {isNewFlight ? "Add New Flight" : "Edit Flight"}
        </h1>
      </div>
      
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2 mb-6">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>{formError}</div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <Plane className="text-flysafari-primary" size={18} />
          <h2 className="text-lg font-semibold">Flight Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Airline and Flight Number */}
            <div>
              <label htmlFor="airline" className="block text-sm font-medium text-gray-700 mb-1">
                Airline*
              </label>
              <select
                id="airline"
                name="airline"
                value={flightData.airline}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              >
                <option value="">Select Airline</option>
                {airlines.map(airline => (
                  <option key={airline} value={airline}>{airline}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Flight Number*
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={flightData.flightNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g., KQ123"
                className="form-input w-full"
              />
            </div>
            
            {/* Route */}
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                From*
              </label>
              <select
                id="from"
                name="from"
                value={flightData.from}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              >
                <option value="">Select Departure City</option>
                {destinations.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                To*
              </label>
              <select
                id="to"
                name="to"
                value={flightData.to}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              >
                <option value="">Select Destination City</option>
                {destinations.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Date and Times */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={flightData.date}
                onChange={handleInputChange}
                required
                className="form-input w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time*
                </label>
                <input
                  type="time"
                  id="departureTime"
                  name="departureTime"
                  value={flightData.departureTime}
                  onChange={handleInputChange}
                  required
                  className="form-input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time*
                </label>
                <input
                  type="time"
                  id="arrivalTime"
                  name="arrivalTime"
                  value={flightData.arrivalTime}
                  onChange={handleInputChange}
                  required
                  className="form-input w-full"
                />
              </div>
            </div>
            
            {/* Price and Seats */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (KES)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={flightData.price}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="e.g., 12500"
                className="form-input w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seatsTotal" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats*
                </label>
                <input
                  type="number"
                  id="seatsTotal"
                  name="seatsTotal"
                  value={flightData.seatsTotal}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="form-input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="seatsAvailable" className="block text-sm font-medium text-gray-700 mb-1">
                  Available Seats*
                </label>
                <input
                  type="number"
                  id="seatsAvailable"
                  name="seatsAvailable"
                  value={flightData.seatsAvailable}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={flightData.seatsTotal}
                  className="form-input w-full"
                />
              </div>
            </div>
            
            {/* Aircraft, Terminal, Gate */}
            <div>
              <label htmlFor="aircraft" className="block text-sm font-medium text-gray-700 mb-1">
                Aircraft
              </label>
              <input
                type="text"
                id="aircraft"
                name="aircraft"
                value={flightData.aircraft}
                onChange={handleInputChange}
                placeholder="e.g., Boeing 737-800"
                className="form-input w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="terminal" className="block text-sm font-medium text-gray-700 mb-1">
                  Terminal
                </label>
                <input
                  type="text"
                  id="terminal"
                  name="terminal"
                  value={flightData.terminal}
                  onChange={handleInputChange}
                  placeholder="e.g., Terminal 1A"
                  className="form-input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="gate" className="block text-sm font-medium text-gray-700 mb-1">
                  Gate
                </label>
                <input
                  type="text"
                  id="gate"
                  name="gate"
                  value={flightData.gate}
                  onChange={handleInputChange}
                  placeholder="e.g., Gate 5"
                  className="form-input w-full"
                />
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                id="status"
                name="status"
                value={flightData.status}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              >
                <option value="Active">Active</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between border-t border-gray-200 pt-6">
            {!isNewFlight && (
              <button
                type="button"
                onClick={() => {/* Handle delete */}}
                className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 inline-flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Flight
              </button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <Link
                to="/admin/flights"
                className="btn btn-outline py-2 px-4"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary py-2 px-6 inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {isNewFlight ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isNewFlight ? "Create Flight" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditFlight;
