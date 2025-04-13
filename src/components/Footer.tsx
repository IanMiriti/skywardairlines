
import { Link } from "react-router-dom";
import { 
  Plane, 
  Facebook, 
  Twitter, 
  Instagram,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-flysafari-dark text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Plane className="h-6 w-6 text-flysafari-secondary" />
              <span className="text-xl font-bold">FlySafari</span>
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted flight booking service for the Kenyan market. 
              Search, book, and fly with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/flights" className="text-gray-300 hover:text-white">
                  Flights
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-gray-300 hover:text-white">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-gray-300 hover:text-white">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Terms & Conditions</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Help Center</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-flysafari-secondary mt-1" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-flysafari-secondary" />
                <span className="text-gray-300">+254 700 000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-flysafari-secondary" />
                <span className="text-gray-300">info@flysafari.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-sm">
          <p>© {currentYear} FlySafari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
