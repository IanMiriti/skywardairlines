
// Flight type definition
export interface Flight {
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
  baggage_allowance: string;
  aircraft?: string;
  amenities?: string[];
  terminal?: string;
  gate?: string;
  status?: string;
}

// Booking type definition
export interface Booking {
  id: string;
  booking_reference: string;
  booking_status: string;
  created_at: string;
  email: string;
  flight_id: string;
  id_passport_number: string;
  is_round_trip: boolean;
  passenger_count: number;
  passenger_name: string;
  payment_method: string;
  payment_reference: string;
  payment_status: string;
  phone_number: string;
  return_flight_id: string | null;
  special_requests: string | null;
  total_amount: number;
  user_id: string;
  updated_at?: string;
  flight?: Flight | null;
  return_flight?: Flight | null;
}

// Flight search filters
export interface FlightFilters {
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  tripType?: 'oneWay' | 'roundTrip';
  airline?: string[];
  priceRange?: [number, number];
}
