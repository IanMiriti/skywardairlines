
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import { Menu, X, Plane, User, LogIn } from "lucide-react";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-flysafari-primary" />
            <span className="text-xl font-bold text-flysafari-dark">
              FlySafari
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/flights" className="text-gray-700 hover:text-flysafari-primary">
              Flights
            </Link>
            <Link to="/offers" className="text-gray-700 hover:text-flysafari-primary">
              Offers
            </Link>
            <Link to="/my-bookings" className="text-gray-700 hover:text-flysafari-primary">
              My Bookings
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="btn-outline btn py-2 px-4 flex items-center gap-2">
                    <LogIn size={18} />
                    <span>Customer Sign In</span>
                  </button>
                </SignInButton>
                <button 
                  onClick={() => navigate('/sign-in')}
                  className="btn btn-primary py-2 px-4 flex items-center gap-2"
                >
                  <User size={18} />
                  <span>Admin Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/flights"
              className="block py-2 text-gray-700 hover:text-flysafari-primary"
              onClick={toggleMenu}
            >
              Flights
            </Link>
            <Link
              to="/offers"
              className="block py-2 text-gray-700 hover:text-flysafari-primary"
              onClick={toggleMenu}
            >
              Offers
            </Link>
            <Link
              to="/my-bookings"
              className="block py-2 text-gray-700 hover:text-flysafari-primary"
              onClick={toggleMenu}
            >
              My Bookings
            </Link>
            <div className="pt-2 border-t border-gray-200">
              {isSignedIn ? (
                <div className="flex items-center">
                  <UserButton afterSignOutUrl="/" />
                  <span className="ml-4 text-sm text-gray-600">Your Account</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <SignInButton mode="modal">
                    <button className="btn-outline btn py-2 w-full flex items-center gap-2 justify-center">
                      <LogIn size={18} />
                      <span>Customer Sign In</span>
                    </button>
                  </SignInButton>
                  <button
                    onClick={() => {
                      navigate('/sign-in');
                      toggleMenu();
                    }}
                    className="btn btn-primary py-2 text-center w-full flex items-center gap-2 justify-center"
                  >
                    <User size={18} />
                    <span>Admin Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
