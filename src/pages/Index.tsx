
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plane, 
  Calendar, 
  Users, 
  Search, 
  ArrowRight, 
  CheckCircle2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroImage from "@/assets/hero-image.png";

const Index = () => {
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to flights page with search params
    window.location.href = `/flights?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}&passengers=${searchParams.passengers}`;
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
    "Nairobi", "Mombasa", "Kisumu", "Malindi", "Eldoret", "Lamu", "Ukunda"
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-flysafari-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-black to-transparent z-0">
          <img 
            src="https://images.unsplash.com/photo-1523374228107-6e44bd2b524e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
            alt="Airplane in the sky" 
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Journey Begins with FlySafari
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Book affordable flights across Kenya with ease. Search, book, and fly with confidence.
            </p>
            <div className="flex gap-4">
              <Link to="/flights" className="btn btn-primary py-3 px-8 rounded-md text-lg">
                Book a Flight
              </Link>
              <Link to="/offers" className="btn btn-outline border-white text-white py-3 px-8 rounded-md text-lg hover:bg-white/10">
                View Offers
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Search Flights Section */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 -mt-20 relative z-20">
            <h2 className="text-2xl font-bold mb-6 text-flysafari-dark">Search for Flights</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <label htmlFor="date" className="text-sm font-medium text-gray-700">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={searchParams.date}
                      onChange={handleInputChange}
                      required
                      className="form-input pl-10 w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
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
              
              <button
                type="submit"
                className="btn btn-secondary w-full py-3 text-lg flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search Flights
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Special Offers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-flysafari-dark">Special Offers</h2>
            <Link 
              to="/offers" 
              className="text-flysafari-primary hover:text-flysafari-primary/80 flex items-center gap-1"
            >
              View all offers <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredOffers.map((offer) => (
              <Link 
                to={`/offers/${offer.id}`} 
                key={offer.id}
                className="bg-white rounded-xl overflow-hidden shadow-md card-hover"
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
                  <p className="text-gray-600 mb-3">
                    Starting from <span className="text-flysafari-primary font-bold">KES {offer.price}</span>
                  </p>
                  <p className="text-sm text-gray-500">Valid for next {offer.daysValid} days</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-flysafari-dark">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-flysafari-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-flysafari-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-flysafari-dark">Search Flights</h3>
              <p className="text-gray-600">
                Enter your departure, destination, and travel date to find available flights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-flysafari-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-flysafari-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-flysafari-dark">Book Your Flight</h3>
              <p className="text-gray-600">
                Choose your preferred flight, enter passenger details, and complete your booking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-flysafari-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="text-flysafari-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-flysafari-dark">Fly with Confidence</h3>
              <p className="text-gray-600">
                Receive your e-ticket via email and prepare for your journey.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/flights" 
              className="btn btn-primary py-3 px-8 rounded-md inline-flex items-center gap-2"
            >
              Book Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-flysafari-dark">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-flysafari-primary/20 flex items-center justify-center">
                  <span className="text-flysafari-primary font-bold">JM</span>
                </div>
                <div>
                  <h4 className="font-semibold">John Mwangi</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "Booking with FlySafari was simple and straightforward. The flight was on time and the service was excellent. Will definitely use again!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-flysafari-primary/20 flex items-center justify-center">
                  <span className="text-flysafari-primary font-bold">AO</span>
                </div>
                <div>
                  <h4 className="font-semibold">Aisha Omondi</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "I found a great deal on FlySafari for my family trip to Mombasa. The booking process was quick and the M-PESA payment option was very convenient."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-flysafari-primary/20 flex items-center justify-center">
                  <span className="text-flysafari-primary font-bold">DK</span>
                </div>
                <div>
                  <h4 className="font-semibold">David Kamau</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "The special offers helped me save a lot on my business trips. The mobile experience is smooth, and customer service is responsive. Highly recommended!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-12 bg-flysafari-primary text-white">
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
                className="form-input flex-grow text-gray-800"
                required
              />
              <button
                type="submit"
                className="btn btn-secondary py-2 px-6"
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
