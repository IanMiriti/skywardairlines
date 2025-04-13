
-- Create a function to safely increment available seats
CREATE OR REPLACE FUNCTION public.increment_available_seats(flight_id UUID, seats_count INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.flights
  SET available_seats = available_seats + seats_count
  WHERE id = flight_id;
END;
$$;
