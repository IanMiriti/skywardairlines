
import { format, parseISO } from "date-fns";
import { Plane, Calendar, Clock, Users } from "lucide-react";
import { Flight } from "@/utils/types";

interface FlightSummaryProps {
  flight: Flight;
  returnFlight: Flight | null;
  passengerCount: number;
  tripType: string;
}

export const FlightSummary = ({
  flight,
  returnFlight,
  passengerCount,
  tripType,
}: FlightSummaryProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEE, MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Time parsing error:', e);
      return dateString;
    }
  };

  return (
    <div className="african-card mb-6">
      <div className="bg-safari-kente text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">Flight Summary</h2>
      </div>
      
      <div className="p-6 bg-gradient-to-r from-white to-safari-sahara/10">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-2 text-safari-orange mb-2">
            <Plane size={18} />
            <h3 className="font-semibold">
              {tripType === 'roundTrip' ? 'Outbound Flight' : 'Selected Flight'}
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <p className="font-medium">{flight.flight_number} • Skyward Express</p>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <p className="text-lg font-bold">{formatTime(flight.departure_time)}</p>
                  <p className="text-sm text-gray-500">{flight.departure_city}</p>
                </div>
                <div className="text-safari-earth">→</div>
                <div>
                  <p className="text-lg font-bold">{formatTime(flight.arrival_time)}</p>
                  <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-0 text-right">
              <div className="flex items-center gap-2 justify-end text-sm text-gray-600">
                <Calendar size={14} />
                <span>{formatDate(flight.departure_time)}</span>
              </div>
              <div className="flex items-center gap-2 justify-end mt-1 text-sm text-gray-600">
                <Clock size={14} />
                <span>{flight.duration}</span>
              </div>
            </div>
          </div>
        </div>
        
        {tripType === 'roundTrip' && returnFlight && (
          <div>
            <div className="flex items-center gap-2 text-safari-wildlife mb-2">
              <Plane size={18} />
              <h3 className="font-semibold">Return Flight</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <p className="font-medium">{returnFlight.flight_number} • Skyward Express</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-lg font-bold">{formatTime(returnFlight.departure_time)}</p>
                    <p className="text-sm text-gray-500">{returnFlight.departure_city}</p>
                  </div>
                  <div className="text-safari-earth">→</div>
                  <div>
                    <p className="text-lg font-bold">{formatTime(returnFlight.arrival_time)}</p>
                    <p className="text-sm text-gray-500">{returnFlight.arrival_city}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0 text-right">
                <div className="flex items-center gap-2 justify-end text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate(returnFlight.departure_time)}</span>
                </div>
                <div className="flex items-center gap-2 justify-end mt-1 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{returnFlight.duration}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <Users size={18} />
            <span>{passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
