
import { Flight } from "@/utils/types";
import { 
  calculateTotalPrice, 
  calculateTaxes, 
  calculateGrandTotal, 
  formatPrice 
} from "@/utils/bookingUtils";

interface PriceSummaryProps {
  flight: Flight;
  returnFlight: Flight | null;
  passengerCount: number;
  tripType: string;
}

export const PriceSummary = ({
  flight,
  returnFlight,
  passengerCount,
  tripType,
}: PriceSummaryProps) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between">
        <span>{flight.departure_city} to {flight.arrival_city}</span>
        <span>{formatPrice(flight.price)}</span>
      </div>
      
      {returnFlight && (
        <div className="flex justify-between">
          <span>{returnFlight.departure_city} to {returnFlight.arrival_city}</span>
          <span>{formatPrice(returnFlight.price)}</span>
        </div>
      )}
      
      <div className="flex justify-between text-gray-500">
        <span>Subtotal ({passengerCount} {passengerCount === 1 ? 'passenger' : 'passengers'})</span>
        <span>{formatPrice(calculateTotalPrice(flight, returnFlight, passengerCount, tripType))}</span>
      </div>
      
      <div className="flex justify-between text-gray-500">
        <span>Taxes & Fees (16%)</span>
        <span>{formatPrice(calculateTaxes(flight, returnFlight, passengerCount, tripType))}</span>
      </div>
      
      <div className="border-t border-gray-200 pt-3 font-bold flex justify-between">
        <span>Total</span>
        <span className="text-safari-orange">{formatPrice(calculateGrandTotal(flight, returnFlight, passengerCount, tripType))}</span>
      </div>
    </div>
  );
};
