
// Helper functions for flight data
import { addDays, addMonths, setHours, setMinutes, format } from "date-fns";
import { Flight } from "./types";

// Get random integer between min and max (inclusive)
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate demo flights between common Kenyan destinations
export const generateFlights = () => {
  const airlines = ["Kenya Airways", "Jambojet", "Fly540", "SafariLink", "Skyward Express", "AirKenya"];
  
  const cities = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Diani",
    "Eldoret",
    "Malindi",
    "Lamu",
    "Lokichoggio"
  ];
  
  const aircrafts = [
    "Boeing 737-800",
    "Bombardier Dash 8",
    "Embraer E190",
    "Cessna Caravan",
    "Bombardier CRJ-200",
    "Dash 8 Q400"
  ];
  
  const amenities = [
    "Wi-Fi",
    "In-flight Entertainment",
    "Meals",
    "Power Outlets",
    "Extra Legroom",
    "Priority Boarding"
  ];
  
  const baggageOptions = [
    "1 x 23kg Checked + 7kg Cabin",
    "2 x 23kg Checked + 7kg Cabin",
    "1 x 30kg Checked + 10kg Cabin",
    "7kg Cabin Only",
    "1 x 20kg Checked + 5kg Cabin"
  ];
  
  const terminals = ["Terminal 1A", "Terminal 1B", "Terminal 1C", "Terminal 1E", "Terminal 2"];
  const gates = ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6", "Gate 7", "Gate 8"];
  
  const flights: Flight[] = [];
  const startDate = new Date(); // Today
  
  // Create flights for each month (June to December)
  for (let month = 0; month < 7; month++) {
    const monthDate = addMonths(startDate, month);
    
    // 4 flights per month
    for (let i = 0; i < 4; i++) {
      const day = getRandomInt(1, 28); // Random day of month
      const flightDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      
      // Generate random routes (ensure departure !== arrival)
      let departureIndex = getRandomInt(0, cities.length - 1);
      let arrivalIndex = getRandomInt(0, cities.length - 1);
      
      while (departureIndex === arrivalIndex) {
        arrivalIndex = getRandomInt(0, cities.length - 1);
      }
      
      const departureCityName = cities[departureIndex];
      const arrivalCityName = cities[arrivalIndex];
      
      // Create a morning flight
      const morningDepartureTime = setMinutes(setHours(flightDate, getRandomInt(6, 11)), getRandomInt(0, 59));
      
      // Flight duration between 45 min - 90 min
      const durationMinutes = getRandomInt(45, 90);
      const morningArrivalTime = addMinutes(morningDepartureTime, durationMinutes);
      
      // Format duration as "Xh Ym"
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationFormatted = hours > 0 
        ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`)
        : `${minutes}m`;
      
      // Random price between 3,500 KES and 25,000 KES
      const price = getRandomInt(3500, 25000);
      
      // Random available seats between 10 and 150
      const availableSeats = getRandomInt(10, 150);
      
      // Random airline
      const airline = airlines[getRandomInt(0, airlines.length - 1)];
      
      // Create flight number (airline code + 3-4 digits)
      let airlineCode;
      switch (airline) {
        case "Kenya Airways": airlineCode = "KQ"; break;
        case "Jambojet": airlineCode = "JM"; break;
        case "Fly540": airlineCode = "5Y"; break;
        case "SafariLink": airlineCode = "SL"; break;
        case "Skyward Express": airlineCode = "SW"; break;
        case "AirKenya": airlineCode = "AK"; break;
        default: airlineCode = "FS";
      }
      
      const flightNumber = `${airlineCode}${getRandomInt(100, 9999)}`;
      
      // Random aircraft
      const aircraft = aircrafts[getRandomInt(0, aircrafts.length - 1)];
      
      // Random baggage allowance
      const baggage = baggageOptions[getRandomInt(0, baggageOptions.length - 1)];
      
      // Random set of amenities (2-4 items)
      const amenityCount = getRandomInt(2, 4);
      const flightAmenities = [...amenities].sort(() => 0.5 - Math.random()).slice(0, amenityCount);
      
      // Random terminal and gate
      const terminal = terminals[getRandomInt(0, terminals.length - 1)];
      const gate = gates[getRandomInt(0, gates.length - 1)];
      
      // Morning flight
      flights.push({
        id: `${flights.length + 1}`,
        airline,
        flight_number: flightNumber,
        departure_city: departureCityName,
        arrival_city: arrivalCityName,
        departure_time: morningDepartureTime.toISOString(),
        arrival_time: morningArrivalTime.toISOString(),
        price,
        duration: durationFormatted,
        available_seats: availableSeats,
        baggage_allowance: baggage,
        aircraft,
        amenities: flightAmenities,
        terminal,
        gate,
        status: "scheduled"
      });
      
      // Evening flight (same route, different time)
      const eveningDepartureTime = setMinutes(setHours(flightDate, getRandomInt(14, 19)), getRandomInt(0, 59));
      const eveningArrivalTime = addMinutes(eveningDepartureTime, durationMinutes);
      
      flights.push({
        id: `${flights.length + 1}`,
        airline,
        flight_number: `${airlineCode}${getRandomInt(100, 9999)}`,
        departure_city: departureCityName,
        arrival_city: arrivalCityName,
        departure_time: eveningDepartureTime.toISOString(),
        arrival_time: eveningArrivalTime.toISOString(),
        price: price + getRandomInt(-500, 1500), // Slight price variation
        duration: durationFormatted,
        available_seats: getRandomInt(10, 150),
        baggage_allowance: baggage,
        aircraft,
        amenities: flightAmenities,
        terminal,
        gate,
        status: "scheduled"
      });
      
      // Return flight option - different day, different flight number
      const returnDate = addDays(flightDate, getRandomInt(1, 7));
      const returnDepartureTime = setMinutes(setHours(returnDate, getRandomInt(7, 18)), getRandomInt(0, 59));
      const returnArrivalTime = addMinutes(returnDepartureTime, durationMinutes);
      
      flights.push({
        id: `${flights.length + 1}`,
        airline,
        flight_number: `${airlineCode}${getRandomInt(100, 9999)}`,
        departure_city: arrivalCityName, // Swapped
        arrival_city: departureCityName, // Swapped
        departure_time: returnDepartureTime.toISOString(),
        arrival_time: returnArrivalTime.toISOString(),
        price: price + getRandomInt(-1000, 2000), // Different price
        duration: durationFormatted,
        available_seats: getRandomInt(10, 150),
        baggage_allowance: baggage,
        aircraft,
        amenities: flightAmenities,
        terminal,
        gate,
        status: "scheduled"
      });
    }
  }
  
  return flights;
};

// Helper function to add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

// Format price in KES
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
};
