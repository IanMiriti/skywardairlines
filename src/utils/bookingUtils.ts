
import { Flight } from "@/utils/types";
import { format, parseISO } from "date-fns";

export const calculateTotalPrice = (
  flight: Flight | null,
  returnFlight: Flight | null,
  passengerCount: number,
  tripType: string
) => {
  if (!flight) return 0;
  
  let basePrice = flight.price;
  
  if (tripType === 'roundTrip' && returnFlight) {
    basePrice += returnFlight.price;
  }
  
  return basePrice * passengerCount;
};

export const calculateTaxes = (
  flight: Flight | null,
  returnFlight: Flight | null,
  passengerCount: number,
  tripType: string
) => {
  return calculateTotalPrice(flight, returnFlight, passengerCount, tripType) * 0.16;
};

export const calculateGrandTotal = (
  flight: Flight | null,
  returnFlight: Flight | null,
  passengerCount: number,
  tripType: string
) => {
  return calculateTotalPrice(flight, returnFlight, passengerCount, tripType) + 
    calculateTaxes(flight, returnFlight, passengerCount, tripType);
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEE, MMM d, yyyy');
  } catch (e) {
    console.error('Date parsing error:', e);
    return dateString;
  }
};

export const formatTime = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (e) {
    console.error('Time parsing error:', e);
    return dateString;
  }
};

export const generateBookingReference = () => {
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = 'FS';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
