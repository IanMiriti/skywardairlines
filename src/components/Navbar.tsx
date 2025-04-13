
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plane, LogIn, LogOut, User, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const renderAuthButtons = () => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-flysafari-primary text-white">
                {getInitials(user.user_metadata?.full_name || user.email || "")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
              <Plane className="mr-2 h-4 w-4" />
              My Bookings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                <UserCircle className="mr-2 h-4 w-4" />
                Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else {
      return (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/sign-in")}
            className="btn-outline btn py-2 px-4 flex items-center gap-2"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => navigate("/sign-up")}
            className="btn btn-primary py-2 px-4 flex items-center gap-2"
          >
            <User size={18} />
            <span>Sign Up</span>
          </button>
        </div>
      );
    }
  };

  const renderMobileAuthButtons = () => {
    if (user) {
      return (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-flysafari-primary text-white">
                {getInitials(user.user_metadata?.full_name || user.email || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              navigate("/profile");
              toggleMenu();
            }}
            className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary"
          >
            <User size={16} />
            Profile
          </button>
          
          <button
            onClick={() => {
              navigate("/my-bookings");
              toggleMenu();
            }}
            className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary"
          >
            <Plane size={16} />
            My Bookings
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                navigate("/admin/dashboard");
                toggleMenu();
              }}
              className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary"
            >
              <UserCircle size={16} />
              Admin Dashboard
            </button>
          )}
          
          <button
            onClick={() => {
              handleSignOut();
              toggleMenu();
            }}
            className="flex w-full items-center gap-2 py-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      );
    } else {
      return (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
          <button
            onClick={() => {
              navigate("/sign-in");
              toggleMenu();
            }}
            className="btn-outline btn py-2 w-full flex items-center gap-2 justify-center"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              navigate("/sign-up");
              toggleMenu();
            }}
            className="btn btn-primary py-2 text-center w-full flex items-center gap-2 justify-center"
          >
            <User size={18} />
            <span>Sign Up</span>
          </button>
        </div>
      );
    }
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
            {renderAuthButtons()}
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
            {renderMobileAuthButtons()}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
