
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Plane, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Users,
  Clock, 
  MapPin,
  SlidersHorizontal,
  X
} from "lucide-react";

// Dummy flight data for now
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
  },
];

// Type for search params
interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

// Type for filter state
interface FilterState {
  sortBy: "price" | "time";
  airline: string[];
  maxPrice: number;
}

const Flights = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Initialize search params from URL
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: queryParams.get("from") || "",
    to: queryParams.get("to") || "",
    date: queryParams.get("date") || "",
    passengers: Number(queryParams.get("passengers")) || 1,
  });
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "price",
    airline: [],
    maxPrice: 20000, // Default max price in KES
  });
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  
  // Available airlines from our mock data
  const availableAirlines = [...new Set(mockFlights.map((flight) => flight.airline))];
  
  // Max price from our mock data
  const highestPrice = Math.max(...mockFlights.map((flight) => flight.price));
  
  // Initialize maxPrice based on data
  useEffect(() => {
    setFilters(prev => ({ ...prev, maxPrice: highestPrice }));
  }, [highestPrice]);
  
  // Handle filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };
  
  // Toggle airline selection
  const toggleAirline = (airline: string) => {
    setFilters((prev) => {
      if (prev.airline.includes(airline)) {
        return {
          ...prev,
          airline: prev.airline.filter((a) => a !== airline),
        };
      } else {
        return {
          ...prev,
          airline: [...prev.airline, airline],
        };
      }
    });
  };
  
  // Apply filters to flights
  const filteredFlights = mockFlights
    .filter((flight) => {
      // Match search params
      const matchesSearch = 
        (!searchParams.from || flight.from === searchParams.from) &&
        (!searchParams.to || flight.to === searchParams.to) &&
        (!searchParams.date || flight.date === searchParams.date);
      
      // Match price filter
      const matchesPrice = flight.price <= filters.maxPrice;
      
      // Match airline filter (if any selected)
      const matchesAirline = 
        filters.airline.length === 0 || 
        filters.airline.includes(flight.airline);
      
      return matchesSearch && matchesPrice && matchesAirline;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price") {
        return a.price - b.price;
      } else {
        // Sort by departure time
        return a.departureTime.localeCompare(b.departureTime);
      }
    });
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Search Header */}
      <div className="bg-flysafari-primary text-white py-8">
        <div className="container">
          <h1 className="text-2xl font-bold mb-6">Find Flights</h1>
          
          {/* Search summary */}
          <div className="bg-white/10 rounded-lg p-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>From: <strong>{searchParams.from || "Any"}</strong></span>
            </div>
            <ArrowRight size={16} className="text-flysafari-secondary" />
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>To: <strong>{searchParams.to || "Any"}</strong></span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Calendar size={16} />
              <span>Date: <strong>{searchParams.date || "Any"}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Passengers: <strong>{searchParams.passengers}</strong></span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-6">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center gap-2 w-full"
          >
            <SlidersHorizontal size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className={`w-full md:w-64 bg-white rounded-lg shadow-sm p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button 
                className="md:hidden text-gray-500"
                onClick={() => setShowFilters(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Sort options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Sort by</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={filters.sortBy === "price"}
                    onChange={() => handleFilterChange("sortBy", "price")}
                    className="form-radio text-flysafari-primary"
                  />
                  <span>Price (Low to High)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={filters.sortBy === "time"}
                    onChange={() => handleFilterChange("sortBy", "time")}
                    className="form-radio text-flysafari-primary"
                  />
                  <span>Departure Time</span>
                </label>
              </div>
            </div>
            
            {/* Price range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Max Price</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={highestPrice}
                  step="500"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>KES 0</span>
                  <span>{formatPrice(filters.maxPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* Airlines */}
            <div>
              <h3 className="text-sm font-medium mb-2">Airlines</h3>
              <div className="space-y-2">
                {availableAirlines.map((airline) => (
                  <label key={airline} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.airline.includes(airline)}
                      onChange={() => toggleAirline(airline)}
                      className="form-checkbox text-flysafari-primary"
                    />
                    <span>{airline}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Flight results */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <p className="text-gray-600">
                <span className="font-semibold text-flysafari-dark">{filteredFlights.length}</span> flights found
              </p>
            </div>
            
            {filteredFlights.length > 0 ? (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <div key={flight.id} className="bg-white rounded-lg shadow-sm overflow-hidden card-hover">
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Flight details */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Plane size={18} className="text-flysafari-primary" />
                            <span className="font-medium text-gray-700">{flight.airline}</span>
                            <span className="text-sm text-gray-500">{flight.flightNumber}</span>
                          </div>
                          <div className="flex items-center mt-3">
                            <div className="text-center">
                              <p className="text-xl font-bold">{flight.departureTime}</p>
                              <p className="text-sm text-gray-500">{flight.from}</p>
                            </div>
                            <div className="mx-4 flex flex-col items-center">
                              <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                              <div className="w-24 md:w-32 h-0.5 bg-gray-300 relative">
                                <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                                <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xl font-bold">{flight.arrivalTime}</p>
                              <p className="text-sm text-gray-500">{flight.to}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{flight.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              <span>{flight.seatsAvailable} seats left</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price and CTA */}
                        <div className="w-full md:w-auto flex flex-col items-center mt-4 md:mt-0">
                          <p className="text-2xl font-bold text-flysafari-primary mb-2">
                            {formatPrice(flight.price)}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">per passenger</p>
                          <Link
                            to={`/flights/${flight.id}`}
                            className="btn btn-primary py-2 px-6 w-full md:w-auto"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Plane size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Flights Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any flights matching your search criteria.
                </p>
                <Link to="/" className="btn btn-primary">
                  Modify Search
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
