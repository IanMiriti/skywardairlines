import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plane, 
  Calendar, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle2,
  MapPin,
  BookOpen,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroImage from "@/assets/hero-image.png";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    tripType: "oneWay" // Default to one-way trip
  });
  const [animatedElements, setAnimatedElements] = useState<boolean[]>([]);

  useEffect(() => {
    // Initialize animations with staggered timing
    const elementsCount = 7; // Number of major sections to animate
    const animationDelay = 200; // ms between animations
    
    for (let i = 0; i < elementsCount; i++) {
      setTimeout(() => {
        setAnimatedElements(prev => {
          const newState = [...prev];
          newState[i] = true;
          return newState;
        });
      }, i * animationDelay);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripTypeChange = (type: string) => {
    setSearchParams((prev) => ({ ...prev, tripType: type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to flights page with search params
    const queryParams = new URLSearchParams();
    queryParams.append("from", searchParams.from);
    queryParams.append("to", searchParams.to);
    queryParams.append("departureDate", searchParams.departureDate);
    
    if (searchParams.tripType === "roundTrip") {
      queryParams.append("returnDate", searchParams.returnDate);
    }
    
    queryParams.append("passengers", searchParams.passengers.toString());
    queryParams.append("tripType", searchParams.tripType);
    
    navigate(`/flights?${queryParams.toString()}`);
  };

  // Sample featured offers
  const featuredOffers = [
    {
      id: 1,
      title: "Nairobi to Mombasa",
      discount: "15% OFF",
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9tYmFzYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      price: "9,999",
      daysValid: 14
    },
    {
      id: 2,
      title: "Nairobi to Kisumu",
      discount: "10% OFF",
      image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2lzdW11fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      price: "8,499",
      daysValid: 7
    },
    {
      id: 3,
      title: "Mombasa to Malindi",
      discount: "20% OFF",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFsaW5kaXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      price: "6,999",
      daysValid: 10
    }
  ];

  // Popular destinations in Kenya
  const popularDestinations = [
    "Nairobi", "Mombasa", "Kisumu", "Malindi", "Eldoret", "Lamu", "Ukunda", "Diani", "Lokichoggio"
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative bg-skyward-dark text-white overflow-hidden ${animatedElements[0] ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-black to-transparent z-0">
          <img 
            src="https://images.unsplash.com/photo-1523374228107-6e44bd2b524e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
            alt="Airplane in the sky" 
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 staggered-fade-in" style={{animationDelay: '200ms'}}>
              Your Journey Begins with Skyward Airlines
            </h1>
            <p className="text-xl md:text-2xl mb-8 staggered-fade-in" style={{animationDelay: '400ms'}}>
              Book affordable flights across Kenya with ease. Search, book, and fly with confidence.
            </p>
            <div className="flex gap-4 staggered-fade-in" style={{animationDelay: '600ms'}}>
              <Link to="/flights" className="bg-skyward-primary hover:bg-skyward-primary/90 text-white py-3 px-8 rounded-md text-lg font-medium nav-button">
                Book a Flight
              </Link>
              <Link to="/offers" className="bg-skyward-secondary hover:bg-skyward-secondary/90 text-white py-3 px-8 rounded-md text-lg font-medium border-2 border-white nav-button">
                View Offers
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Search Flights Section */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className={`max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 -mt-20 relative z-20 ${animatedElements[1] ? 'slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold mb-6 text-skyward-dark">Search for Flights</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Type Selection */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4 w-full md:w-1/2">
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 text-center rounded-md transition-colors ${
                    searchParams.tripType === "oneWay" 
                      ? "bg-skyward-primary text-white" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleTripTypeChange("oneWay")}
                >
                  One Way
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 px-4 text-center rounded-md transition-colors ${
                    searchParams.tripType === "roundTrip" 
                      ? "bg-skyward-primary text-white" 
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleTripTypeChange("roundTrip")}
                >
                  Round Trip
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="from" className="text-sm font-medium text-gray-700">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      id="from"
                      name="from"
                      value={searchParams.from}
                      onChange={handleInputChange}
                      required
                      className="form-input pl-10 w-full"
                    >
                      <option value="">Select departure city</option>
                      {popularDestinations.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="to" className="text-sm font-medium text-gray-700">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      id="to"
                      name="to"
                      value={searchParams.to}
                      onChange={handleInputChange}
                      required
                      className="form-input pl-10 w-full"
                    >
                      <option value="">Select destination city</option>
                      {popularDestinations.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="departureDate" className="text-sm font-medium text-gray-700">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      id="departureDate"
                      name="departureDate"
                      value={searchParams.departureDate}
                      onChange={handleInputChange}
                      required
                      className="form-input pl-10 w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                {searchParams.tripType === "roundTrip" && (
                  <div className="space-y-2">
                    <label htmlFor="returnDate" className="text-sm font-medium text-gray-700">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        id="returnDate"
                        name="returnDate"
                        value={searchParams.returnDate}
                        onChange={handleInputChange}
                        required
                        className="form-input pl-10 w-full"
                        min={searchParams.departureDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}
                
                {searchParams.tripType === "oneWay" && (
                  <div className="space-y-2">
                    <label htmlFor="passengers" className="text-sm font-medium text-gray-700">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        id="passengers"
                        name="passengers"
                        value={searchParams.passengers}
                        onChange={handleInputChange}
                        className="form-input pl-10 w-full"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Passenger" : "Passengers"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {searchParams.tripType === "roundTrip" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="passengers" className="text-sm font-medium text-gray-700">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        id="passengers"
                        name="passengers"
                        value={searchParams.passengers}
                        onChange={handleInputChange}
                        className="form-input pl-10 w-full"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Passenger" : "Passengers"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-secondary w-full py-3 text-lg flex items-center justify-center gap-2 nav-button"
              >
                <Search size={20} className="icon-spin" />
                Search Flights
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Special Offers Section */}
      <section className={`py-16 bg-gray-50 ${animatedElements[2] ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-skyward-dark">Special Offers</h2>
            <Link 
              to="/offers" 
              className="text-skyward-primary hover:text-skyward-primary/80 flex items-center gap-1 nav-item"
            >
              View all offers <ArrowRight size={16} className="floating" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredOffers.map((offer, index) => (
              <Link 
                to={`/offers/${offer.id}`} 
                key={offer.id}
                className={`bg-white rounded-xl overflow-hidden shadow-md card-hover staggered-fade-in`} 
                style={{animationDelay: `${index * 150 + 300}ms`}}
              >
                <div className="relative h-48">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-skyward-secondary text-white py-1 px-3 rounded-full font-semibold text-sm pulsing">
                    {offer.discount}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-skyward-dark">{offer.title}</h3>
                  <p className="text-gray-600 mb-3">
                    Starting from <span className="text-skyward-primary font-bold">KES {offer.price}</span>
                  </p>
                  <p className="text-sm text-gray-500">Valid for next {offer.daysValid} days</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className={`py-16 bg-white ${animatedElements[3] ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-skyward-dark">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="text-skyward-primary icon-spin" size={28} />,
                title: "Search Flights",
                description: "Enter your departure, destination, and travel date to find available flights."
              },
              {
                icon: <BookOpen className="text-skyward-primary icon-spin" size={28} />,
                title: "Book Your Flight",
                description: "Choose your preferred flight, enter passenger details, and complete your booking."
              },
              {
                icon: <Plane className="text-skyward-primary icon-spin" size={28} />,
                title: "Fly with Confidence",
                description: "Receive your e-ticket via email and prepare for your journey."
              }
            ].map((step, index) => (
              <div key={index} className={`text-center staggered-fade-in`} style={{animationDelay: `${index * 200 + 400}ms`}}>
                <div className="w-16 h-16 bg-skyward-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 hover-scale">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-skyward-dark">{step.title}</h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/flights" 
              className="btn btn-primary py-3 px-8 rounded-md inline-flex items-center gap-2 nav-button"
            >
              Book Now <ArrowRight size={20} className="floating" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className={`py-16 bg-gray-50 ${animatedElements[4] ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-skyward-dark">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                initials: "JM",
                name: "John Mwangi",
                text: "Booking with Skyward Airlines was simple and straightforward. The flight was on time and the service was excellent. Will definitely use again!"
              },
              {
                initials: "AO",
                name: "Aisha Omondi",
                text: "I found a great deal on Skyward Airlines for my family trip to Mombasa. The booking process was quick and the M-PESA payment option was very convenient."
              },
              {
                initials: "DK",
                name: "David Kamau",
                text: "The special offers helped me save a lot on my business trips. The mobile experience is smooth, and customer service is responsive. Highly recommended!"
              }
            ].map((testimonial, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-md card-hover staggered-fade-in`} style={{animationDelay: `${index * 150 + 300}ms`}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-skyward-primary/20 flex items-center justify-center pulsing">
                    <span className="text-skyward-primary font-bold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className={`py-12 bg-skyward-primary text-white ${animatedElements[5] ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6">
              Stay updated with the latest flight deals and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="form-input flex-grow text-gray-800 hover-scale"
                required
              />
              <button
                type="submit"
                className="btn btn-secondary py-2 px-6 nav-button"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
