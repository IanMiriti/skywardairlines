
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
  Check
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
  
  // Filter state - removed airline filter
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "price",
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
  
  // Available cities and price range from our data
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
          .select('*')
          .eq('airline', 'Skyward Express'); // Only filter for Skyward Express flights
        
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
            .select('*')
            .eq('airline', 'Skyward Express'); // Only filter for Skyward Express flights
          
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
      [filterType]: value
    }));
  };
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Apply filters to flights
  const applyFilters = (flightList: Flight[]) => {
    return flightList.filter(flight => {
      // Price filter
      if (flight.price < filters.minPrice || flight.price > filters.maxPrice) {
        return false;
      }
      
      // Departure city filter
      if (filters.departureCity.length > 0 && !filters.departureCity.includes(flight.departure_city)) {
        return false;
      }
      
      // Arrival city filter
      if (filters.arrivalCity.length > 0 && !filters.arrivalCity.includes(flight.arrival_city)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price') {
        return a.price - b.price;
      } else {
        // Sort by departure time
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      }
    });
  };
  
  const filteredFlights = applyFilters(flights);
  const filteredReturnFlights = applyFilters(returnFlights);
  
  // Format duration
  const formatDuration = (duration: string) => {
    return duration;
  };
  
  // Calculate flight time
  const calculateFlightTime = (departure: string, arrival: string) => {
    const departureTime = new Date(departure).getTime();
    const arrivalTime = new Date(arrival).getTime();
    const durationMs = arrivalTime - departureTime;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      sortBy: 'price',
      minPrice: lowestPrice,
      maxPrice: highestPrice,
      departureCity: [],
      arrivalCity: []
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if there are any active filters
  const hasActiveFilters = () => {
    return (
      filters.minPrice > lowestPrice ||
      filters.maxPrice < highestPrice ||
      filters.departureCity.length > 0 ||
      filters.arrivalCity.length > 0
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skyward-primary"></div>
          <p className="mt-4 text-gray-600">Loading flights...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary py-2 px-6"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header and search summary */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Available Flights</h1>
            <p className="text-gray-600 mt-1">
              {searchParams.from && searchParams.to && (
                <span>
                  {searchParams.from} to {searchParams.to}
                  {searchParams.departureDate && (
                    <span> • {formatDate(searchParams.departureDate)}</span>
                  )}
                  {searchParams.passengers && (
                    <span> • {searchParams.passengers} passenger{searchParams.passengers !== 1 ? 's' : ''}</span>
                  )}
                </span>
              )}
            </p>
          </div>
          
          <Link to="/" className="btn btn-outline py-2 px-4 flex items-center gap-2 self-start md:self-auto">
            <ArrowLeft size={16} />
            Modify Search
          </Link>
        </div>
      </div>
      
      {/* Filter and results container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters - Desktop */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              {hasActiveFilters() && (
                <button
                  onClick={resetFilters}
                  className="text-skyward-primary text-sm hover:underline flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
            </div>
            
            {/* Sort by */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Sort by</h4>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'price'}
                    onChange={() => handleFilterChange('sortBy', 'price')}
                    className="form-radio text-skyward-primary h-4 w-4"
                  />
                  <span>Price (lowest first)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'time'}
                    onChange={() => handleFilterChange('sortBy', 'time')}
                    className="form-radio text-skyward-primary h-4 w-4"
                  />
                  <span>Departure time (earliest first)</span>
                </label>
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="px-2">
                <input
                  type="range"
                  min={lowestPrice}
                  max={highestPrice}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                  className="w-full h-2 accent-skyward-primary rounded-lg appearance-none cursor-pointer bg-gray-200"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{formatPrice(lowestPrice)}</span>
                  <span>{formatPrice(filters.maxPrice)}</span>
                  <span>{formatPrice(highestPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* Departure Cities */}
            {departureCities.length > 1 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Departure City</h4>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {departureCities.map((city) => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.departureCity.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('departureCity', [...filters.departureCity, city]);
                          } else {
                            handleFilterChange(
                              'departureCity',
                              filters.departureCity.filter((c) => c !== city)
                            );
                          }
                        }}
                        className="form-checkbox text-skyward-primary h-4 w-4 rounded"
                      />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Arrival Cities */}
            {arrivalCities.length > 1 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Arrival City</h4>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {arrivalCities.map((city) => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.arrivalCity.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('arrivalCity', [...filters.arrivalCity, city]);
                          } else {
                            handleFilterChange(
                              'arrivalCity',
                              filters.arrivalCity.filter((c) => c !== city)
                            );
                          }
                        }}
                        className="form-checkbox text-skyward-primary h-4 w-4 rounded"
                      />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile filter button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-primary py-2 px-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end">
            <div className="bg-white rounded-t-xl p-5 w-full animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              {/* Sort by */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Sort by</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.sortBy === 'price'}
                      onChange={() => handleFilterChange('sortBy', 'price')}
                      className="form-radio text-skyward-primary h-4 w-4"
                    />
                    <span>Price (lowest first)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.sortBy === 'time'}
                      onChange={() => handleFilterChange('sortBy', 'time')}
                      className="form-radio text-skyward-primary h-4 w-4"
                    />
                    <span>Departure time (earliest first)</span>
                  </label>
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min={lowestPrice}
                    max={highestPrice}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="w-full h-2 accent-skyward-primary rounded-lg appearance-none cursor-pointer bg-gray-200"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>{formatPrice(lowestPrice)}</span>
                    <span>{formatPrice(filters.maxPrice)}</span>
                    <span>{formatPrice(highestPrice)}</span>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline py-2 px-4 flex-1"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn btn-primary py-2 px-4 flex-1"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Flight results column */}
        <div className="lg:col-span-3">
          {/* Departure Flights */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plane className="text-skyward-primary" size={18} />
              Outbound Flight
              <span className="text-sm font-normal text-gray-600">
                ({formatDate(searchParams.departureDate || '')})
              </span>
            </h2>
            
            {filteredFlights.length > 0 ? (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-skyward-light p-2 rounded">
                            <Plane className="text-skyward-primary" size={22} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Skyward Express</h3>
                            <p className="text-sm text-gray-500">{flight.flight_number}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                          {/* Departure */}
                          <div className="text-center">
                            <p className="text-xl font-bold">{formatTime(flight.departure_time)}</p>
                            <p className="text-sm text-gray-600">{flight.departure_city}</p>
                          </div>
                          
                          {/* Flight duration */}
                          <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 mb-1">{flight.duration || calculateFlightTime(flight.departure_time, flight.arrival_time)}</p>
                            <div className="w-24 md:w-32 h-[1px] bg-gray-300 relative">
                              <div className="absolute -top-1.5 right-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                              <div className="absolute -top-1.5 left-0 w-2.5 h-2.5 rounded-full bg-skyward-primary"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Direct</p>
                          </div>
                          
                          {/* Arrival */}
                          <div className="text-center">
                            <p className="text-xl font-bold">{formatTime(flight.arrival_time)}</p>
                            <p className="text-sm text-gray-600">{flight.arrival_city}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users size={16} className="mr-1" />
                            <span>
                              {flight.available_seats} seat{flight.available_seats !== 1 ? 's' : ''} left
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <Clock size={16} className="inline mr-1" />
                            {flight.baggage_allowance}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="text-right md:text-left">
                            <p className="text-2xl font-bold text-skyward-primary">{formatPrice(flight.price)}</p>
                            <p className="text-xs text-gray-500">per passenger</p>
                          </div>
                          
                          <Link
                            to={`/flights/${flight.id}`}
                            className="btn btn-primary py-2 px-6 ml-auto md:ml-0"
                          >
                            Select
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <AlertCircle className="mx-auto mb-4 text-skyward-secondary" size={48} />
                <h3 className="text-xl font-semibold mb-2">No Flights Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any flights matching your criteria. Try adjusting your search parameters.
                </p>
                <Link to="/" className="btn btn-primary py-2 px-6">
                  Modify Search
                </Link>
              </div>
            )}
          </div>
          
          {/* Return Flights */}
          {searchParams.tripType === 'roundTrip' && searchParams.returnDate && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plane className="text-skyward-primary transform rotate-180" size={18} />
                Return Flight
                <span className="text-sm font-normal text-gray-600">
                  ({formatDate(searchParams.returnDate || '')})
                </span>
              </h2>
              
              {filteredReturnFlights.length > 0 ? (
                <div className="space-y-4">
                  {filteredReturnFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="p-4 md:p-5">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-skyward-light p-2 rounded">
                              <Plane className="text-skyward-primary transform rotate-180" size={22} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Skyward Express</h3>
                              <p className="text-sm text-gray-500">{flight.flight_number}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
                            {/* Departure */}
                            <div className="text-center">
                              <p className="text-xl font-bold">{formatTime(flight.departure_time)}</p>
                              <p className="text-sm text-gray-600">{flight.departure_city}</p>
                            </div>
                            
                            {/* Flight duration */}
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-gray-500 mb-1">{flight.duration || calculateFlightTime(flight.departure_time, flight.arrival_time)}</p>
                              <div className="w-24 md:w-32 h-[1px] bg-gray-300 relative">
                                <div className="absolute -top-1.5 right-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="absolute -top-1.5 left-0 w-2.5 h-2.5 rounded-full bg-skyward-primary"></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Direct</p>
                            </div>
                            
                            {/* Arrival */}
                            <div className="text-center">
                              <p className="text-xl font-bold">{formatTime(flight.arrival_time)}</p>
                              <p className="text-sm text-gray-600">{flight.arrival_city}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users size={16} className="mr-1" />
                              <span>
                                {flight.available_seats} seat{flight.available_seats !== 1 ? 's' : ''} left
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <Clock size={16} className="inline mr-1" />
                              {flight.baggage_allowance}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="text-right md:text-left">
                              <p className="text-2xl font-bold text-skyward-primary">{formatPrice(flight.price)}</p>
                              <p className="text-xs text-gray-500">per passenger</p>
                            </div>
                            
                            <Link
                              to={`/flights/${flight.id}`}
                              className="btn btn-primary py-2 px-6 ml-auto md:ml-0"
                            >
                              Select
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <AlertCircle className="mx-auto mb-4 text-skyward-secondary" size={48} />
                  <h3 className="text-xl font-semibold mb-2">No Return Flights Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any return flights matching your criteria. Try adjusting your search parameters.
                  </p>
                  <Link to="/" className="btn btn-primary py-2 px-6">
                    Modify Search
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flights;
