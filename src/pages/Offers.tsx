
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Plane, Calendar } from "lucide-react";

// Mock offers data with the Nairobi to Lamu offer removed
const mockOffers = [
  {
    id: 1,
    title: "Nairobi to Mombasa",
    description: "Special weekend rates for coastal flights",
    discount: "15% OFF",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9tYmFzYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    price: 9999,
    originalPrice: 11750,
    route: {
      from: "Nairobi",
      to: "Mombasa"
    },
    validUntil: "2025-05-15",
    daysValid: 14,
    terms: [
      "Valid for direct flights only",
      "Subject to availability",
      "Blackout dates may apply",
      "Cannot be combined with other offers"
    ]
  },
  {
    id: 2,
    title: "Nairobi to Kisumu",
    description: "Midweek special to Lake Victoria",
    discount: "10% OFF",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2lzdW11fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    price: 8499,
    originalPrice: 9450,
    route: {
      from: "Nairobi",
      to: "Kisumu"
    },
    validUntil: "2025-05-30",
    daysValid: 7,
    terms: [
      "Valid for direct flights only",
      "Subject to availability",
      "Valid for Tuesday and Wednesday flights only",
      "Cannot be combined with other offers"
    ]
  },
  {
    id: 3,
    title: "Mombasa to Malindi",
    description: "Coastal hopper discount",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFsaW5kaXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    price: 6999,
    originalPrice: 8750,
    route: {
      from: "Mombasa",
      to: "Malindi"
    },
    validUntil: "2025-06-15",
    daysValid: 30,
    terms: [
      "Valid for direct flights only",
      "Subject to availability",
      "Blackout dates may apply during high season",
      "Cannot be combined with other offers"
    ]
  },
  {
    id: 4,
    title: "Nairobi to Eldoret",
    description: "Highland express special",
    discount: "12% OFF",
    image: "https://images.unsplash.com/photo-1531219572328-a0171b4448a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxkb3JldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    price: 7250,
    originalPrice: 8250,
    route: {
      from: "Nairobi",
      to: "Eldoret"
    },
    validUntil: "2025-05-20",
    daysValid: 21,
    terms: [
      "Valid for direct flights only",
      "Subject to availability",
      "Blackout dates may apply",
      "Cannot be combined with other offers"
    ]
  },
];

const Offers = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        {/* Hero section with animation */}
        <div className="bg-flysafari-primary rounded-xl overflow-hidden relative mb-12 animate-fade-in">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
              alt="Special offers" 
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative z-10 p-6 md:p-12 text-white">
            <div className="max-w-2xl">
              <Tag className="mb-4 text-flysafari-secondary" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Special Flight Offers
              </h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Explore our limited-time deals on flights across Kenya. Book now and save on your next journey.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} />
                <span>Offers updated regularly. Book while they last!</span>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-flysafari-dark">Current Offers</h2>
        
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <Link 
                to={`/offers/${offer.id}`} 
                key={offer.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow hover-scale card-hover animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-48">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-flysafari-secondary text-white py-1 px-3 rounded-full font-semibold text-sm">
                    {offer.discount}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-flysafari-dark">{offer.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {offer.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Plane size={14} className="text-flysafari-primary" />
                    <span className="text-sm text-gray-600">
                      {offer.route.from} to {offer.route.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-flysafari-primary" />
                    <span className="text-sm text-gray-600">
                      Valid until {offer.validUntil}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-flysafari-primary">
                        {formatPrice(offer.price)}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(offer.originalPrice)}
                      </p>
                    </div>
                    <div className="text-flysafari-secondary flex items-center gap-1 font-medium group">
                      View Offer <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center animate-fade-in">
            <div className="text-gray-400 mb-4">
              <Tag size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Offers Available</h3>
            <p className="text-gray-600 mb-6">
              There are currently no special offers available. Please check back later.
            </p>
            <Link to="/flights" className="btn btn-primary">
              Browse Flights
            </Link>
          </div>
        )}
        
        {/* Terms and conditions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold mb-4">General Terms & Conditions</h3>
          <ul className="space-y-2 text-gray-600 list-disc pl-5">
            <li>All offers are subject to availability and may be withdrawn at any time without notice.</li>
            <li>Prices shown are for one-way tickets unless otherwise specified.</li>
            <li>Booking must be made during the offer period for travel during the specified travel period.</li>
            <li>Blackout dates may apply, especially during peak travel seasons and holidays.</li>
            <li>Changes to bookings may result in the loss of the promotional fare.</li>
            <li>All bookings are subject to FlySafari's general terms and conditions of carriage.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Offers;
