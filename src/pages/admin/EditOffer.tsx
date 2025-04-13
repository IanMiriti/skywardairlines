
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Tag, 
  Save, 
  Trash2, 
  AlertCircle,
  Plane,
  Calendar
} from "lucide-react";

// Mock offer for editing
const mockOffer = {
  id: 1,
  title: "Nairobi to Mombasa",
  description: "Special weekend rates for coastal flights",
  discount: "15",
  route: {
    from: "Nairobi",
    to: "Mombasa"
  },
  validUntil: "2025-05-15",
  price: 9999,
  originalPrice: 11750,
  status: "Active",
  flights: [1, 3, 5], // IDs of flights included in this offer
  terms: [
    "Valid for direct flights only",
    "Subject to availability",
    "Blackout dates may apply",
    "Cannot be combined with other offers"
  ]
};

// Available destinations
const destinations = [
  "Nairobi", 
  "Mombasa", 
  "Kisumu", 
  "Eldoret", 
  "Malindi", 
  "Lamu", 
  "Ukunda"
];

const AdminEditOffer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewOffer = id === "new";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    discount: "",
    from: "",
    to: "",
    validUntil: "",
    price: "",
    originalPrice: "",
    status: "Active",
    terms: ""
  });
  
  useEffect(() => {
    if (isNewOffer) {
      // Set default values for new offer
      setOfferData({
        title: "",
        description: "",
        discount: "",
        from: "Nairobi",
        to: "",
        validUntil: "",
        price: "",
        originalPrice: "",
        status: "Active",
        terms: "Valid for direct flights only\nSubject to availability\nBlackout dates may apply\nCannot be combined with other offers"
      });
      setLoading(false);
    } else {
      // Fetch offer data
      setTimeout(() => {
        if (mockOffer) {
          setOfferData({
            title: mockOffer.title,
            description: mockOffer.description,
            discount: mockOffer.discount,
            from: mockOffer.route.from,
            to: mockOffer.route.to,
            validUntil: mockOffer.validUntil,
            price: mockOffer.price.toString(),
            originalPrice: mockOffer.originalPrice.toString(),
            status: mockOffer.status,
            terms: mockOffer.terms.join("\n")
          });
        }
        setLoading(false);
      }, 800);
    }
  }, [id, isNewOffer]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate original price when discount and price change
    if (name === "discount" || name === "price") {
      if (name === "discount" && offerData.price) {
        const price = parseFloat(offerData.price);
        const discount = parseFloat(value) / 100;
        
        if (!isNaN(price) && !isNaN(discount)) {
          const originalPrice = Math.round(price / (1 - discount));
          setOfferData(prev => ({ ...prev, originalPrice: originalPrice.toString() }));
        }
      } else if (name === "price" && offerData.discount) {
        const price = parseFloat(value);
        const discount = parseFloat(offerData.discount) / 100;
        
        if (!isNaN(price) && !isNaN(discount)) {
          const originalPrice = Math.round(price / (1 - discount));
          setOfferData(prev => ({ ...prev, originalPrice: originalPrice.toString() }));
        }
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form
    if (
      !offerData.title ||
      !offerData.description ||
      !offerData.discount ||
      !offerData.from ||
      !offerData.to ||
      !offerData.validUntil ||
      !offerData.price ||
      !offerData.originalPrice
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    
    if (offerData.from === offerData.to) {
      setFormError("Departure and destination cannot be the same.");
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      // Navigate back to offers list
      navigate("/admin/offers");
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-3 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to offers
        </button>
        
        <h1 className="text-2xl font-bold text-flysafari-dark">
          {isNewOffer ? "Add New Offer" : "Edit Offer"}
        </h1>
      </div>
      
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2 mb-6">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>{formError}</div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <Tag className="text-flysafari-secondary" size={18} />
          <h2 className="text-lg font-semibold">Offer Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Title and Description */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Offer Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={offerData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Nairobi to Mombasa Special"
                className="form-input w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={offerData.description}
                onChange={handleInputChange}
                required
                placeholder="Brief description of the offer"
                className="form-input w-full"
              />
            </div>
            
            {/* Route */}
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                From*
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  id="from"
                  name="from"
                  value={offerData.from}
                  onChange={handleInputChange}
                  required
                  className="form-input pl-10 w-full"
                >
                  <option value="">Select Departure City</option>
                  {destinations.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                To*
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  id="to"
                  name="to"
                  value={offerData.to}
                  onChange={handleInputChange}
                  required
                  className="form-input pl-10 w-full"
                >
                  <option value="">Select Destination City</option>
                  {destinations.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Discount and Validity */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage*
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={offerData.discount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="99"
                  placeholder="e.g., 15"
                  className="form-input pr-8 w-full"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until*
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  value={offerData.validUntil}
                  onChange={handleInputChange}
                  required
                  className="form-input pl-10 w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Prices */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price (KES)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={offerData.price}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 9999"
                className="form-input w-full"
              />
            </div>
            
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (KES)*
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={offerData.originalPrice}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 11750"
                className="form-input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated based on discount %</p>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                id="status"
                name="status"
                value={offerData.status}
                onChange={handleInputChange}
                required
                className="form-input w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            {/* Terms and Conditions */}
            <div className="md:col-span-2">
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                id="terms"
                name="terms"
                value={offerData.terms}
                onChange={handleInputChange}
                rows={5}
                placeholder="Enter each term on a new line"
                className="form-input w-full"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Enter each term on a new line</p>
            </div>
          </div>
          
          <div className="flex justify-between border-t border-gray-200 pt-6">
            {!isNewOffer && (
              <button
                type="button"
                onClick={() => {/* Handle delete */}}
                className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 inline-flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Offer
              </button>
            )}
            
            <div className="flex gap-3 ml-auto">
              <Link
                to="/admin/offers"
                className="btn btn-outline py-2 px-4"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary py-2 px-6 inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {isNewOffer ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isNewOffer ? "Create Offer" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditOffer;
