
import { useState, useEffect } from "react";
import { 
  X, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Search, 
  FilterX, 
  RefreshCw,
  Plane
} from "lucide-react";

// Mock flights data with some cancelled flights
const mockFlights = [
  {
    id: 1,
    airline: "Kenya Airways",
    flightNumber: "KQ123",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "08:00 AM",
    arrivalTime: "09:00 AM",
    date: "2025-05-01",
    status: "Active",
    affectedPassengers: 12
  },
  {
    id: 2,
    airline: "Jambojet",
    flightNumber: "JM456",
    from: "Nairobi",
    to: "Kisumu",
    departureTime: "10:30 AM",
    arrivalTime: "11:30 AM",
    date: "2025-05-01",
    status: "Active",
    affectedPassengers: 8
  },
  {
    id: 3,
    airline: "Fly540",
    flightNumber: "FL789",
    from: "Mombasa",
    to: "Nairobi",
    departureTime: "02:15 PM",
    arrivalTime: "03:15 PM",
    date: "2025-05-01",
    status: "Active",
    affectedPassengers: 15
  },
  {
    id: 4,
    airline: "Safarilink",
    flightNumber: "SF101",
    from: "Nairobi",
    to: "Lamu",
    departureTime: "07:45 AM",
    arrivalTime: "09:15 AM",
    date: "2025-05-01",
    status: "Active",
    affectedPassengers: 6
  },
  {
    id: 5,
    airline: "Kenya Airways",
    flightNumber: "KQ321",
    from: "Kisumu",
    to: "Nairobi",
    departureTime: "05:00 PM",
    arrivalTime: "06:00 PM",
    date: "2025-05-01",
    status: "Cancelled",
    cancellationReason: "Operational issues",
    dateOfCancellation: "2025-04-15",
    affectedPassengers: 18
  },
  {
    id: 6,
    airline: "Jambojet",
    flightNumber: "JM789",
    from: "Nairobi",
    to: "Eldoret",
    departureTime: "09:15 AM",
    arrivalTime: "10:15 AM",
    date: "2025-05-02",
    status: "Cancelled",
    cancellationReason: "Weather conditions",
    dateOfCancellation: "2025-04-20",
    affectedPassengers: 9
  },
];

const AdminCancellations = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [flightToCancel, setFlightToCancel] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setFlights(mockFlights);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleCancelClick = (flight: any) => {
    setFlightToCancel(flight);
    setCancellationReason("");
    setCancelModalOpen(true);
  };
  
  const handleReinstateClick = (flightId: number) => {
    // Simulate API call to reinstate flight
    setFlights(prevFlights => 
      prevFlights.map(flight => 
        flight.id === flightId 
          ? { ...flight, status: "Active" } 
          : flight
      )
    );
  };
  
  const confirmCancellation = () => {
    if (!cancellationReason.trim()) {
      return; // Don't allow empty reason
    }
    
    // Simulate API call to cancel flight
    setFlights(prevFlights => 
      prevFlights.map(flight => 
        flight.id === flightToCancel.id 
          ? { 
              ...flight, 
              status: "Cancelled", 
              cancellationReason, 
              dateOfCancellation: new Date().toISOString().split('T')[0] 
            } 
          : flight
      )
    );
    
    setCancelModalOpen(false);
    setFlightToCancel(null);
    setCancellationReason("");
  };
  
  // Filter flights based on search and status
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && flight.status === "Active") ||
      (statusFilter === "cancelled" && flight.status === "Cancelled");
    
    return matchesSearch && matchesStatus;
  });
  
  // Group flights by status
  const activeFlights = filteredFlights.filter(flight => flight.status === "Active");
  const cancelledFlights = filteredFlights.filter(flight => flight.status === "Cancelled");
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Flight Cancellations</h1>
          <p className="text-gray-600">Manage flight cancellations and reinstatements</p>
        </div>
        
        <button 
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
          className="btn btn-outline py-2 px-4 inline-flex items-center gap-2 self-start"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search flights..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="form-input w-full"
            >
              <option value="all">All Flights</option>
              <option value="active">Active Flights</option>
              <option value="cancelled">Cancelled Flights</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredFlights.length > 0 ? (
        <div className="space-y-8">
          {/* Active Flights Section */}
          {(statusFilter === "all" || statusFilter === "active") && activeFlights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                Active Flights ({activeFlights.length})
              </h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flight</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Route</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Passengers</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeFlights.map((flight) => (
                        <tr key={flight.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Plane className="text-flysafari-primary" size={16} />
                              <div>
                                <div className="font-medium">{flight.airline}</div>
                                <div className="text-xs text-gray-500">{flight.flightNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span>{flight.from}</span>
                              <span className="text-xs text-gray-500">to</span>
                              <span>{flight.to}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-500" />
                                <span>{flight.date}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {flight.departureTime} - {flight.arrivalTime}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {flight.affectedPassengers} booked
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleCancelClick(flight)}
                              className="inline-flex items-center gap-1 py-1 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Cancelled Flights Section */}
          {(statusFilter === "all" || statusFilter === "cancelled") && cancelledFlights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                Cancelled Flights ({cancelledFlights.length})
              </h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flight</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Route</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Passengers</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelledFlights.map((flight) => (
                        <tr key={flight.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Plane className="text-gray-400" size={16} />
                              <div>
                                <div className="font-medium">{flight.airline}</div>
                                <div className="text-xs text-gray-500">{flight.flightNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span>{flight.from}</span>
                              <span className="text-xs text-gray-500">to</span>
                              <span>{flight.to}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-500" />
                                <span>{flight.date}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {flight.departureTime} - {flight.arrivalTime}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-sm">{flight.cancellationReason}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                Cancelled on {flight.dateOfCancellation}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-red-600">
                              {flight.affectedPassengers} affected
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleReinstateClick(flight.id)}
                              className="inline-flex items-center gap-1 py-1 px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm"
                            >
                              <RefreshCw size={14} />
                              Reinstate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FilterX size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Flights Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "No flights match your search criteria. Try a different search or filter."
              : "There are no flights in the system yet."}
          </p>
          <div className="flex justify-center gap-4">
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="btn btn-outline py-2 px-4"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>
      )}
      
      {/* Cancellation Modal */}
      {cancelModalOpen && flightToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Cancel Flight</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel the following flight?
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="text-flysafari-primary" size={16} />
                <span className="font-medium">
                  {flightToCancel.airline} {flightToCancel.flightNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {flightToCancel.from} to {flightToCancel.to}
                </span>
                <span>•</span>
                <span>{flightToCancel.date}, {flightToCancel.departureTime}</span>
              </div>
              <div className="text-sm text-red-600 mt-2">
                This will affect {flightToCancel.affectedPassengers} booked passengers.
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Reason*
              </label>
              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="form-input w-full"
                placeholder="Please provide a reason for cancellation"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setFlightToCancel(null);
                }}
                className="btn btn-outline py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancellation}
                disabled={!cancellationReason.trim()}
                className={`btn py-2 px-4 text-white ${
                  cancellationReason.trim() 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCancellations;
