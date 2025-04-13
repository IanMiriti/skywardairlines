
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Plane, ArrowLeftRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Common Kenyan destinations
const destinations = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Eldoret",
  "Malindi",
  "Lamu",
  "Lokichoggio",
  "Ukunda (Diani)",
];

const FlightSearchForm = () => {
  const navigate = useNavigate();

  // Form state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default to 2 weeks from now
  );
  const [passengers, setPassengers] = useState(1);

  // Switch departure and arrival cities
  const handleSwitchCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!from || !to || !departureDate) {
      // Show error for required fields
      alert("Please fill all required fields");
      return;
    }

    if (tripType === "roundTrip" && !returnDate) {
      alert("Please select a return date");
      return;
    }

    // Build search query
    const queryParams = new URLSearchParams();
    queryParams.append("from", from);
    queryParams.append("to", to);
    queryParams.append("departureDate", format(departureDate, "yyyy-MM-dd"));
    if (tripType === "roundTrip" && returnDate) {
      queryParams.append("returnDate", format(returnDate, "yyyy-MM-dd"));
    }
    queryParams.append("passengers", passengers.toString());
    queryParams.append("tripType", tripType);

    // Navigate to flights page with search params
    navigate(`/flights?${queryParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex gap-4 mb-6">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="tripType"
            value="oneWay"
            checked={tripType === "oneWay"}
            onChange={() => setTripType("oneWay")}
            className="form-radio text-flysafari-primary"
          />
          <span className="ml-2">One Way</span>
        </label>

        <label className="inline-flex items-center">
          <input
            type="radio"
            name="tripType"
            value="roundTrip"
            checked={tripType === "roundTrip"}
            onChange={() => setTripType("roundTrip")}
            className="form-radio text-flysafari-primary"
          />
          <span className="ml-2">Round Trip</span>
        </label>
      </div>

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label
              htmlFor="from"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="form-select pl-10 w-full"
                required
              >
                <option value="">Select departure city</option>
                {destinations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To
            </label>
            <div className="relative flex">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="form-select pl-10 w-full"
                required
              >
                <option value="">Select arrival city</option>
                {destinations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSwitchCities}
                className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-gray-400 hover:text-flysafari-primary"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full form-input pl-10 text-left flex items-center",
                      !departureDate && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    {departureDate ? (
                      format(departureDate, "MMM d, yyyy")
                    ) : (
                      <span>Select date</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tripType === "roundTrip" ? "Return Date" : "Return Date (Optional)"}
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full form-input pl-10 text-left flex items-center",
                      !returnDate && "text-gray-400",
                      tripType !== "roundTrip" && "opacity-70"
                    )}
                    disabled={tripType !== "roundTrip"}
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    {returnDate ? (
                      format(returnDate, "MMM d, yyyy")
                    ) : (
                      <span>Select date</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    disabled={(date) => 
                      date < new Date() || 
                      (departureDate && date < departureDate)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label
              htmlFor="passengers"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Passengers
            </label>
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                id="passengers"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="form-select pl-10 w-full"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "passenger" : "passengers"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 text-base"
        >
          <Plane size={18} />
          Search Flights
        </button>
      </form>
    </div>
  );
};

export default FlightSearchForm;
