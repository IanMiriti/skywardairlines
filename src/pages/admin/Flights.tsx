import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plane, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FilterX,
  Calendar
} from "lucide-react";

// Mock flights data - Updated airline name to Skyward Express
const mockFlights = [
  {
    id: 1,
    airline: "Skyward Express",
    flightNumber: "SE123",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "08:00 AM",
    arrivalTime: "09:00 AM",
    date: "2025-05-01",
    price: 12500,
    seatsAvailable: 25,
    status: "Active"
  },
  {
    id: 2,
    airline: "Skyward Express",
    flightNumber: "SE456",
    from: "Nairobi",
    to: "Kisumu",
    departureTime: "10:30 AM",
    arrivalTime: "11:30 AM",
    date: "2025-05-01",
    price: 9800,
    seatsAvailable: 18,
    status: "Active"
  },
  {
    id: 3,
    airline: "Skyward Express",
    flightNumber: "SE789",
    from: "Mombasa",
    to: "Nairobi",
    departureTime: "02:15 PM",
    arrivalTime: "03:15 PM",
    date: "2025-05-01",
    price: 11200,
    seatsAvailable: 12,
    status: "Active"
  },
  {
    id: 4,
    airline: "Skyward Express",
    flightNumber: "SE101",
    from: "Nairobi",
    to: "Lamu",
    departureTime: "07:45 AM",
    arrivalTime: "09:15 AM",
    date: "2025-05-01",
    price: 18500,
    seatsAvailable: 8,
    status: "Active"
  },
  {
    id: 5,
    airline: "Skyward Express",
    flightNumber: "SE321",
    from: "Kisumu",
    to: "Nairobi",
    departureTime: "05:00 PM",
    arrivalTime: "06:00 PM",
    date: "2025-05-01",
    price: 10200,
    seatsAvailable: 15,
    status: "Cancelled"
  },
];

const AdminFlights = () => {
  // ... keep existing code (state variables and hooks)
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<number | null>(null);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setFlights(mockFlights);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleDeleteClick = (flightId: number) => {
    setFlightToDelete(flightId);
    setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    // In a real app, you would make an API call to delete the flight
    setFlights(prevFlights => prevFlights.filter(flight => flight.id !== flightToDelete));
    setDeleteModalOpen(false);
    setFlightToDelete(null);
  };
  
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setFlightToDelete(null);
  };
  
  // Filter flights based on search term and status filter
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || flight.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return (
        <span className="flex items-center gap-1 text-green-700 bg-green-100 py-1 px-2 rounded text-xs font-medium">
          <CheckCircle2 size={12} />
          Active
        </span>
      );
    } else if (status === "Cancelled") {
      return (
        <span className="flex items-center gap-1 text-red-700 bg-red-100 py-1 px-2 rounded text-xs font-medium">
          <AlertCircle size={12} />
          Cancelled
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 py-1 px-2 rounded text-xs font-medium">
          <AlertCircle size={12} />
          {status}
        </span>
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skyward-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-skyward-dark">Manage Flights</h1>
          <p className="text-gray-600">Add, edit, or remove flights</p>
        </div>
        
        <Link 
          to="/admin/flights/new" 
          className="btn btn-primary py-2 px-4 inline-flex items-center gap-2 self-start"
        >
          <Plus size={16} />
          Add New Flight
        </Link>
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
              onChange={handleSearch}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="form-input w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Flights Table */}
      {filteredFlights.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flight</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Route</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Seats</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((flight) => (
                  <tr key={flight.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Plane className="text-skyward-primary" size={16} />
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
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(flight.price)}
                    </td>
                    <td className="px-4 py-3">
                      {flight.seatsAvailable}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(flight.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/flights/${flight.id}/edit`}
                          className="p-1 text-gray-600 hover:text-skyward-primary rounded-md"
                          title="Edit Flight"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(flight.id)}
                          className="p-1 text-gray-600 hover:text-red-600 rounded-md"
                          title="Delete Flight"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <Link
              to="/admin/flights/new"
              className="btn btn-primary py-2 px-4 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Flight
            </Link>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this flight? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="btn btn-outline py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFlights;
