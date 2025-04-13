
-- Create a function to safely decrement available seats
CREATE OR REPLACE FUNCTION public.decrement_available_seats(flight_id UUID, seats_count INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.flights
  SET available_seats = greatest(0, available_seats - seats_count)
  WHERE id = flight_id;
END;
$$;
