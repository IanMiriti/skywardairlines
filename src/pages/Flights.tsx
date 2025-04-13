
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { 
  Plane, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Users,
  Clock, 
  MapPin,
  SlidersHorizontal,
  X,
  AlertCircle,
  Filter,
  Check,
  ArrowLeftRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Type for flight data
interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  duration: string;
  available_seats: number;
  aircraft?: string;
  amenities?: string[];
  baggage_allowance: string;
  terminal?: string;
  gate?: string;
  status?: string;
}

// Type for search params
interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: string;
}

// Type for filter state
interface FilterState {
  sortBy: "price" | "time";
  airline: string[];
  minPrice: number;
  maxPrice: number;
  departureCity: string[];
  arrivalCity: string[];
}

const Flights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Initialize search params from URL
  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: queryParams.get("from") || "",
    to: queryParams.get("to") || "",
    departureDate: queryParams.get("departureDate") || "",
    returnDate: queryParams.get("returnDate") || "",
    passengers: Number(queryParams.get("passengers")) || 1,
    tripType: queryParams.get("tripType") || "oneWay",
  });
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "price",
    airline: [],
    minPrice: 0,
    maxPrice: 50000, // Default max price in KES
    departureCity: [],
    arrivalCity: []
  });
  
  // Flight data states
  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  
  // Available airlines, cities, and price range from our data
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  const [departureCities, setDepartureCities] = useState<string[]>([]);
  const [arrivalCities, setArrivalCities] = useState<string[]>([]);
  const [highestPrice, setHighestPrice] = useState(50000);
  const [lowestPrice, setLowestPrice] = useState(0);
  
  // Fetch flights data from Supabase
  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('flights')
          .select('*');
        
        // Apply search parameters if provided
        if (searchParams.from) {
          query = query.eq('departure_city', searchParams.from);
        }
        
        if (searchParams.to) {
          query = query.eq('arrival_city', searchParams.to);
        }
        
        if (searchParams.departureDate) {
          // Match flights on the selected date (ignoring time)
          const startDate = new Date(searchParams.departureDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(searchParams.departureDate);
          endDate.setHours(23, 59, 59, 999);
          
          query = query
            .gte('departure_time', startDate.toISOString())
            .lte('departure_time', endDate.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setFlights(data || []);
        
        // Get all unique airlines
        const airlines = [...new Set(data?.map(flight => flight.airline) || [])];
        setAvailableAirlines(airlines);
        
        // Get all unique departure cities
        const depCities = [...new Set(data?.map(flight => flight.departure_city) || [])];
        setDepartureCities(depCities);
        
        // Get all unique arrival cities
        const arrCities = [...new Set(data?.map(flight => flight.arrival_city) || [])];
        setArrivalCities(arrCities);
        
        // Find min and max prices
        if (data && data.length > 0) {
          const prices = data.map(flight => flight.price);
          setHighestPrice(Math.max(...prices));
          setLowestPrice(Math.min(...prices));
          setFilters(prev => ({
            ...prev,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices)
          }));
        }
        
        // If round trip, fetch return flights
        if (searchParams.tripType === 'roundTrip' && searchParams.returnDate) {
          let returnQuery = supabase
            .from('flights')
            .select('*');
          
          // Swap from/to for return flights
          if (searchParams.to) {
            returnQuery = returnQuery.eq('departure_city', searchParams.to);
          }
          
          if (searchParams.from) {
            returnQuery = returnQuery.eq('arrival_city', searchParams.from);
          }
          
          if (searchParams.returnDate) {
            // Match flights on the selected return date (ignoring time)
            const startDate = new Date(searchParams.returnDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(searchParams.returnDate);
            endDate.setHours(23, 59, 59, 999);
            
            returnQuery = returnQuery
              .gte('departure_time', startDate.toISOString())
              .lte('departure_time', endDate.toISOString());
          }
          
          const { data: returnData, error: returnError } = await returnQuery;
          
          if (returnError) {
            throw returnError;
          }
          
          setReturnFlights(returnData || []);
        }
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Failed to load flights. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load flights. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
  }, [searchParams]);
  
  // Initialize maxPrice based on data
  useEffect(() => {
    if (highestPrice > 0) {
      setFilters(prev => ({ ...prev, maxPrice: highestPrice }));
    }
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
  
  // Toggle departure city selection
  const toggleDepartureCity = (city: string) => {
    setFilters((prev) => {
      if (prev.departureCity.includes(city)) {
        return {
          ...prev,
          departureCity: prev.departureCity.filter((c) => c !== city),
        };
      } else {
        return {
          ...prev,
          departureCity: [...prev.departureCity, city],
        };
      }
    });
  };
  
  // Toggle arrival city selection
  const toggleArrivalCity = (city: string) => {
    setFilters((prev) => {
      if (prev.arrivalCity.includes(city)) {
        return {
          ...prev,
          arrivalCity: prev.arrivalCity.filter((c) => c !== city),
        };
      } else {
        return {
          ...prev,
          arrivalCity: [...prev.arrivalCity, city],
        };
      }
    });
  };
  
  // Apply filters to flights
  const filteredFlights = flights
    .filter((flight) => {
      // Match airline filter (if any selected)
      const matchesAirline = 
        filters.airline.length === 0 || 
        filters.airline.includes(flight.airline);
      
      // Match price filter
      const matchesPrice = 
        flight.price >= filters.minPrice && 
        flight.price <= filters.maxPrice;
      
      // Match departure city filter (if any selected)
      const matchesDepartureCity = 
        filters.departureCity.length === 0 || 
        filters.departureCity.includes(flight.departure_city);
      
      // Match arrival city filter (if any selected)
      const matchesArrivalCity = 
        filters.arrivalCity.length === 0 || 
        filters.arrivalCity.includes(flight.arrival_city);
      
      return matchesAirline && matchesPrice && matchesDepartureCity && matchesArrivalCity;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price") {
        return a.price - b.price;
      } else {
        // Sort by departure time
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
    });
  
  // Apply filters to return flights
  const filteredReturnFlights = returnFlights
    .filter((flight) => {
      // Match airline filter (if any selected)
      const matchesAirline = 
        filters.airline.length === 0 || 
        filters.airline.includes(flight.airline);
      
      // Match price filter
      const matchesPrice = 
        flight.price >= filters.minPrice && 
        flight.price <= filters.maxPrice;
      
      // Match departure city filter (if any selected)
      const matchesDepartureCity = 
        filters.departureCity.length === 0 || 
        filters.departureCity.includes(flight.departure_city);
      
      // Match arrival city filter (if any selected)
      const matchesArrivalCity = 
        filters.arrivalCity.length === 0 || 
        filters.arrivalCity.includes(flight.arrival_city);
      
      return matchesAirline && matchesPrice && matchesDepartureCity && matchesArrivalCity;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price") {
        return a.price - b.price;
      } else {
        // Sort by departure time
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
    });
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    queryParams.append("from", searchParams.from);
    queryParams.append("to", searchParams.to);
    queryParams.append("departureDate", searchParams.departureDate);
    
    if (searchParams.tripType === "roundTrip") {
      queryParams.append("returnDate", searchParams.returnDate);
    }
    
    queryParams.append("passengers", searchParams.passengers.toString());
    queryParams.append("tripType", searchParams.tripType);
    
    navigate(`/flights?${queryParams.toString()}`);
  };
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Time parsing error:', e);
      return dateString;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-flysafari-dark">Searching for flights...</h2>
          <p className="text-gray-600 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-flysafari-dark mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Search Header */}
      <div className="bg-flysafari-primary text-white py-8">
        <div className="container">
          <h1 className="text-2xl font-bold mb-6">Find Flights</h1>
          
          {/* Search form */}
          <div className="bg-white/10 rounded-lg p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              {/* Trip type toggle */}
              <div className="flex bg-white/20 p-1 rounded-lg w-full md:w-1/3 mb-2">
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 text-center text-sm rounded-md transition-colors ${
                    searchParams.tripType === "oneWay" 
                      ? "bg-white text-flysafari-primary" 
                      : "text-white hover:bg-white/20"
                  }`}
                  onClick={() => setSearchParams(prev => ({ ...prev, tripType: "oneWay" }))}
                >
                  One Way
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 text-center text-sm rounded-md transition-colors ${
                    searchParams.tripType === "roundTrip" 
                      ? "bg-white text-flysafari-primary" 
                      : "text-white hover:bg-white/20"
                  }`}
                  onClick={() => setSearchParams(prev => ({ ...prev, tripType: "roundTrip" }))}
                >
                  Round Trip
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="from" className="block text-sm font-medium text-white/80 mb-1">From</label>
                  <select
                    id="from"
                    name="from"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
                    className="form-input w-full bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  >
                    <option value="">Any city</option>
                    {departureCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-white/80 mb-1">To</label>
                  <select
                    id="to"
                    name="to"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                    className="form-input w-full bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  >
                    <option value="">Any city</option>
                    {arrivalCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="departureDate" className="block text-sm font-medium text-white/80 mb-1">Departure Date</label>
                  <input
                    type="date"
                    id="departureDate"
                    name="departureDate"
                    value={searchParams.departureDate}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="form-input w-full bg-white/20 border-white/30 text-white"
                  />
                </div>
                
                {searchParams.tripType === "roundTrip" && (
                  <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium text-white/80 mb-1">Return Date</label>
                    <input
                      type="date"
                      id="returnDate"
                      name="returnDate"
                      value={searchParams.returnDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                      min={searchParams.departureDate}
                      className="form-input w-full bg-white/20 border-white/30 text-white"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="passengers" className="block text-sm font-medium text-white/80 mb-1">Passengers</label>
                  <select
                    id="passengers"
                    name="passengers"
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: Number(e.target.value) }))}
                    className="form-input w-full bg-white/20 border-white/30 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn bg-white text-flysafari-primary hover:bg-white/90 py-2 px-6"
                >
                  Update Search
                </button>
              </div>
            </form>
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
          <aside className={`w-full md:w-64 bg-white rounded-lg shadow-sm p-4 ${showFilters ? 'block' : 'hidden md:block'} sticky top-4 h-fit`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Filter size={18} />
                Filters
              </h2>
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
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min={lowestPrice}
                  max={highestPrice}
                  step="500"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(lowestPrice)}</span>
                  <span>{formatPrice(filters.maxPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* Airlines */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Airlines</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
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
            
            {/* Departure Cities */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Departure From</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departureCities.map((city) => (
                  <label key={city} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.departureCity.includes(city)}
                      onChange={() => toggleDepartureCity(city)}
                      className="form-checkbox text-flysafari-primary"
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Arrival Cities */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Arrival To</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {arrivalCities.map((city) => (
                  <label key={city} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.arrivalCity.includes(city)}
                      onChange={() => toggleArrivalCity(city)}
                      className="form-checkbox text-flysafari-primary"
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Reset filters */}
            <button
              onClick={() => setFilters({
                sortBy: "price",
                airline: [],
                minPrice: lowestPrice,
                maxPrice: highestPrice,
                departureCity: [],
                arrivalCity: []
              })}
              className="text-flysafari-primary text-sm hover:underline flex items-center gap-1 mt-2"
            >
              Reset all filters
            </button>
          </aside>
          
          {/* Flight results */}
          <div className="flex-1">
            {/* Results summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-gray-600">
                  <span className="font-semibold text-flysafari-dark">
                    {searchParams.tripType === "oneWay" 
                      ? filteredFlights.length
                      : `${filteredFlights.length} outbound, ${filteredReturnFlights.length} return`}
                  </span> flights found
                </p>
                
                {searchParams.tripType === "roundTrip" && (
                  <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full">
                    <ArrowLeftRight size={14} />
                    <span>Round Trip</span>
                  </div>
                )}
              </div>
            </div>
            
            {searchParams.tripType === "oneWay" ? (
              /* One-way flights */
              <>
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
                                <span className="text-sm text-gray-500">{flight.flight_number}</span>
                              </div>
                              <div className="flex items-center mt-3">
                                <div className="text-center">
                                  <p className="text-xl font-bold">{formatTime(flight.departure_time)}</p>
                                  <p className="text-sm text-gray-500">{flight.departure_city}</p>
                                </div>
                                <div className="mx-4 flex flex-col items-center">
                                  <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                                  <div className="w-24 md:w-32 h-0.5 bg-gray-300 relative">
                                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                                    <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold">{formatTime(flight.arrival_time)}</p>
                                  <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{formatDate(flight.departure_time)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={14} />
                                  <span>{flight.available_seats} seats left</span>
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
                                to={`/flights/${flight.id}?passengers=${searchParams.passengers}&tripType=${searchParams.tripType}`}
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
              </>
            ) : (
              /* Round-trip flights */
              <>
                {filteredFlights.length > 0 || filteredReturnFlights.length > 0 ? (
                  <div className="space-y-8">
                    {/* Outbound flights */}
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="bg-flysafari-primary text-white text-xs py-1 px-2 rounded">Outbound</span>
                        {searchParams.from} to {searchParams.to}
                        <span className="text-sm font-normal text-gray-500">
                          {searchParams.departureDate && `• ${searchParams.departureDate}`}
                        </span>
                      </h2>
                      
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
                                      <span className="text-sm text-gray-500">{flight.flight_number}</span>
                                    </div>
                                    <div className="flex items-center mt-3">
                                      <div className="text-center">
                                        <p className="text-xl font-bold">{formatTime(flight.departure_time)}</p>
                                        <p className="text-sm text-gray-500">{flight.departure_city}</p>
                                      </div>
                                      <div className="mx-4 flex flex-col items-center">
                                        <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                                        <div className="w-24 md:w-32 h-0.5 bg-gray-300 relative">
                                          <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                                          <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xl font-bold">{formatTime(flight.arrival_time)}</p>
                                        <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{formatDate(flight.departure_time)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>{flight.available_seats} seats left</span>
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
                                      to={`/flights/${flight.id}?passengers=${searchParams.passengers}&tripType=${searchParams.tripType}&returnDate=${searchParams.returnDate}`}
                                      className="btn btn-primary py-2 px-6 w-full md:w-auto"
                                    >
                                      Select Outbound
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                          <p className="text-gray-600">
                            No outbound flights found for this date/route. Please try different search criteria.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Return flights */}
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="bg-flysafari-secondary text-white text-xs py-1 px-2 rounded">Return</span>
                        {searchParams.to} to {searchParams.from}
                        <span className="text-sm font-normal text-gray-500">
                          {searchParams.returnDate && `• ${searchParams.returnDate}`}
                        </span>
                      </h2>
                      
                      {filteredReturnFlights.length > 0 ? (
                        <div className="space-y-4">
                          {filteredReturnFlights.map((flight) => (
                            <div key={flight.id} className="bg-white rounded-lg shadow-sm overflow-hidden card-hover">
                              <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  {/* Flight details */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Plane size={18} className="text-flysafari-secondary" />
                                      <span className="font-medium text-gray-700">{flight.airline}</span>
                                      <span className="text-sm text-gray-500">{flight.flight_number}</span>
                                    </div>
                                    <div className="flex items-center mt-3">
                                      <div className="text-center">
                                        <p className="text-xl font-bold">{formatTime(flight.departure_time)}</p>
                                        <p className="text-sm text-gray-500">{flight.departure_city}</p>
                                      </div>
                                      <div className="mx-4 flex flex-col items-center">
                                        <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                                        <div className="w-24 md:w-32 h-0.5 bg-gray-300 relative">
                                          <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-secondary"></div>
                                          <div className="absolute -right-1 -top-1.5 w-3 h-3 rounded-full bg-flysafari-primary"></div>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xl font-bold">{formatTime(flight.arrival_time)}</p>
                                        <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{formatDate(flight.departure_time)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>{flight.available_seats} seats left</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Price and CTA */}
                                  <div className="w-full md:w-auto flex flex-col items-center mt-4 md:mt-0">
                                    <p className="text-2xl font-bold text-flysafari-secondary mb-2">
                                      {formatPrice(flight.price)}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">per passenger</p>
                                    <Link
                                      to={`/flights/${flight.id}?passengers=${searchParams.passengers}&tripType=${searchParams.tripType}&departureDate=${searchParams.departureDate}`}
                                      className="btn bg-flysafari-secondary hover:bg-flysafari-secondary/90 text-white py-2 px-6 w-full md:w-auto"
                                    >
                                      Select Return
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                          <p className="text-gray-600">
                            No return flights found for this date/route. Please try different search criteria.
                          </p>
                        </div>
                      )}
                    </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;
