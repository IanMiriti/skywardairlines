
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FilterX,
  Calendar
} from "lucide-react";

// Mock offers data (simplified)
const mockOffers = [
  {
    id: 1,
    title: "Nairobi to Mombasa",
    description: "Special weekend rates for coastal flights",
    discount: "15%",
    route: {
      from: "Nairobi",
      to: "Mombasa"
    },
    validUntil: "2025-05-15",
    price: 9999,
    originalPrice: 11750,
    status: "Active"
  },
  {
    id: 2,
    title: "Nairobi to Kisumu",
    description: "Midweek special to Lake Victoria",
    discount: "10%",
    route: {
      from: "Nairobi",
      to: "Kisumu"
    },
    validUntil: "2025-05-30",
    price: 8499,
    originalPrice: 9450,
    status: "Active"
  },
  {
    id: 3,
    title: "Mombasa to Malindi",
    description: "Coastal hopper discount",
    discount: "20%",
    route: {
      from: "Mombasa",
      to: "Malindi"
    },
    validUntil: "2025-06-15",
    price: 6999,
    originalPrice: 8750,
    status: "Active"
  },
  {
    id: 4,
    title: "Nairobi to Eldoret",
    description: "Highland express special",
    discount: "12%",
    route: {
      from: "Nairobi",
      to: "Eldoret"
    },
    validUntil: "2025-05-20",
    price: 7250,
    originalPrice: 8250,
    status: "Inactive"
  },
  {
    id: 5,
    title: "Nairobi to Lamu",
    description: "Island getaway special",
    discount: "18%",
    route: {
      from: "Nairobi",
      to: "Lamu"
    },
    validUntil: "2025-06-30",
    price: 13999,
    originalPrice: 17080,
    status: "Active"
  },
];

const AdminOffers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setOffers(mockOffers);
      setLoading(false);
    }, 800);
  }, []);
  
  // Format price in KES
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Filter offers based on search and status
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.route.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || offer.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
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
          <h1 className="text-2xl font-bold text-flysafari-dark">Manage Offers</h1>
          <p className="text-gray-600">Add, edit, or remove special offers</p>
        </div>
        
        <Link 
          to="/admin/offers/new" 
          className="btn btn-primary py-2 px-4 inline-flex items-center gap-2 self-start"
        >
          <Plus size={16} />
          Add New Offer
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Offers Table */}
      {filteredOffers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Offer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Route</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valid Until</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Tag className="text-flysafari-secondary mt-1" size={16} />
                        <div>
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{offer.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span>{offer.route.from}</span>
                        <span className="text-xs text-gray-500"> to </span>
                        <span>{offer.route.to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-flysafari-secondary/10 text-flysafari-secondary py-1 px-2 rounded text-xs font-medium">
                        {offer.discount} OFF
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-500" />
                        <span>{offer.validUntil}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{formatPrice(offer.price)}</div>
                        <div className="text-xs text-gray-500 line-through">{formatPrice(offer.originalPrice)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`py-1 px-2 rounded text-xs font-medium ${
                        offer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/offers/${offer.id}/edit`}
                          className="p-1 text-gray-600 hover:text-flysafari-primary rounded-md"
                          title="Edit Offer"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          className="p-1 text-gray-600 hover:text-red-600 rounded-md"
                          title="Delete Offer"
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
          <h3 className="text-xl font-semibold mb-2">No Offers Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "No offers match your search criteria. Try a different search or filter."
              : "There are no offers in the system yet."}
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
              to="/admin/offers/new"
              className="btn btn-primary py-2 px-4 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Offer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
