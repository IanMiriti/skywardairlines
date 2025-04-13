import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Tag, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Plane, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Mock offers data (modified to remove Nairobi to Lamu)
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
    ],
    flights: [
      {
        id: 101,
        airline: "Kenya Airways",
        flightNumber: "KQ123",
        departureTime: "08:00 AM",
        arrivalTime: "09:00 AM",
        date: "2025-05-01",
        price: 9999,
        duration: "1h",
        seatsAvailable: 25,
      },
      {
        id: 102,
        airline: "Jambojet",
        flightNumber: "JM234",
        departureTime: "11:30 AM",
        arrivalTime: "12:30 PM",
        date: "2025-05-02",
        price: 9999,
        duration: "1h",
        seatsAvailable: 18,
      },
      {
        id: 103,
        airline: "Kenya Airways",
        flightNumber: "KQ345",
        departureTime: "02:45 PM",
        arrivalTime: "03:45 PM",
        date: "2025-05-03",
        price: 9999,
        duration: "1h",
        seatsAvailable: 12,
      }
    ]
  },
  // Add other offers from Offers.tsx (2, 3, 4) but exclude 5 (Nairobi to Lamu)
];

const OfferDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundOffer = mockOffers.find(o => o.id.toString() === id);
      setOffer(foundOffer || null);
      setLoading(false);
    }, 800);
  }, [id]);
  
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
  
  if (!offer) {
    return (
      <div className="container py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Offer Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the offer you're looking for. It may have expired or been removed.
          </p>
          <Link to="/offers" className="btn btn-primary">
            Browse All Offers
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-flysafari-primary mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to offers
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Offer details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Offer header with image */}
              <div className="relative h-64">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <div className="bg-flysafari-secondary inline-block py-1 px-3 rounded-full font-semibold text-sm mb-2">
                    {offer.discount}
                  </div>
                  <h1 className="text-2xl font-bold mb-1">{offer.title}</h1>
                  <p>{offer.description}</p>
                </div>
              </div>
              
              {/* Offer details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Offer Details</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Plane size={18} className="text-flysafari-primary mt-1" />
                        <div>
                          <span className="font-medium">Route:</span>{" "}
                          <span>{offer.route.from} to {offer.route.to}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calendar size={18} className="text-flysafari-primary mt-1" />
                        <div>
                          <span className="font-medium">Valid Until:</span>{" "}
                          <span>{offer.validUntil}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Tag size={18} className="text-flysafari-primary mt-1" />
                        <div>
                          <span className="font-medium">Discounted Price:</span>{" "}
                          <span className="text-flysafari-primary font-bold">{formatPrice(offer.price)}</span>{" "}
                          <span className="text-sm text-gray-500 line-through">{formatPrice(offer.originalPrice)}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
                    <ul className="space-y-2">
                      {offer.terms.map((term: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-green-500 mt-1" />
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold mb-4">Available Flights</h2>
                  
                  <div className="space-y-4">
                    {offer.flights.map((flight: any) => (
                      <div 
                        key={flight.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:border-flysafari-primary transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Plane size={16} className="text-flysafari-primary" />
                              <span className="font-medium">{flight.airline}</span>
                              <span className="text-sm text-gray-500">{flight.flightNumber}</span>
                            </div>
                            
                            <div className="flex items-center my-2">
                              <div className="text-center">
                                <p className="font-semibold">{flight.departureTime}</p>
                                <p className="text-sm text-gray-500">{offer.route.from}</p>
                              </div>
                              <div className="mx-3 flex flex-col items-center flex-1">
                                <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                                <div className="w-full h-0.5 bg-gray-300 relative">
                                  <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-primary"></div>
                                  <div className="absolute -right-1 -top-1.5 w-2 h-2 rounded-full bg-flysafari-secondary"></div>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold">{flight.arrivalTime}</p>
                                <p className="text-sm text-gray-500">{offer.route.to}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{flight.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Duration: {flight.duration}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-col items-end justify-between gap-2">
                            <div className="text-right">
                              <p className="text-lg font-bold text-flysafari-primary">
                                {formatPrice(flight.price)}
                              </p>
                              <p className="text-xs text-gray-500">{flight.seatsAvailable} seats left</p>
                            </div>
                            
                            <Link
                              to={`/flights/${flight.id}`}
                              className="btn btn-primary py-1 px-4 whitespace-nowrap"
                            >
                              Select
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Offer summary and CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Offer Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="font-medium">{offer.title}</span>
                  <span className="bg-flysafari-secondary/10 text-flysafari-secondary py-1 px-2 rounded-md text-sm font-medium">
                    {offer.discount}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="text-gray-500 line-through">{formatPrice(offer.originalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Discounted Price</span>
                  <span className="font-bold text-flysafari-primary">{formatPrice(offer.price)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>You Save</span>
                  <span>{formatPrice(offer.originalPrice - offer.price)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-flysafari-primary" />
                  Offer Validity
                </h3>
                <p className="text-sm text-gray-600">
                  This offer is valid until <span className="font-medium">{offer.validUntil}</span>.
                  Book now to secure your discounted flight.
                </p>
              </div>
              
              <Link
                to="/flights"
                className="btn btn-secondary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                Book This Offer <ArrowRight size={18} />
              </Link>
              
              <div className="text-center mt-4 text-sm text-gray-500">
                Limited seats available at this price
              </div>
            </div>
            
            {/* More offers */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="font-semibold mb-4">Other Popular Destinations</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/offers/2" className="flex justify-between items-center group hover-scale">
                    <span className="group-hover:text-flysafari-primary transition-colors">Nairobi to Kisumu</span>
                    <span className="text-sm text-flysafari-secondary">10% OFF</span>
                  </Link>
                </li>
                <li>
                  <Link to="/offers/3" className="flex justify-between items-center group hover-scale">
                    <span className="group-hover:text-flysafari-primary transition-colors">Mombasa to Malindi</span>
                    <span className="text-sm text-flysafari-secondary">20% OFF</span>
                  </Link>
                </li>
                <li>
                  <Link to="/offers/4" className="flex justify-between items-center group hover-scale">
                    <span className="group-hover:text-flysafari-primary transition-colors">Nairobi to Eldoret</span>
                    <span className="text-sm text-flysafari-secondary">12% OFF</span>
                  </Link>
                </li>
                <li>
                  <Link to="/offers" className="text-flysafari-primary flex items-center gap-1 mt-2 text-sm group">
                    View all offers <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
