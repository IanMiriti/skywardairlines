
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderAuthButtons = () => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer hover-scale">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-flysafari-primary text-white">
                {getInitials(user.user_metadata?.full_name || user.email || "")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate("/profile")} 
              className="hover-scale"
            >
              <User className="mr-2 h-4 w-4 icon-spin" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate("/my-bookings")} 
              className="hover-scale"
            >
              <Plane className="mr-2 h-4 w-4 icon-spin" />
              My Bookings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem 
                onClick={() => navigate("/admin/dashboard")} 
                className="hover-scale"
              >
                <UserCircle className="mr-2 h-4 w-4 icon-spin" />
                Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="hover-scale text-red-500 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4 icon-spin" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else {
      return (
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/auth")}
            className="nav-button btn-outline btn py-2 px-4 flex items-center gap-2 floating"
          >
            <LogIn size={18} className="icon-spin" />
            <span>Sign In</span>
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
            className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary zoom-on-hover"
          >
            <User size={16} />
            Profile
          </button>
          
          <button
            onClick={() => {
              navigate("/my-bookings");
              toggleMenu();
            }}
            className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary zoom-on-hover"
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
              className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-flysafari-primary zoom-on-hover"
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
            className="flex w-full items-center gap-2 py-2 text-red-600 hover:text-red-700 zoom-on-hover"
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
              navigate("/auth");
              toggleMenu();
            }}
            className="btn-outline btn py-2 w-full flex items-center gap-2 justify-center zoom-on-hover"
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        </div>
      );
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover-scale floating">
            <Plane className="h-6 w-6 text-flysafari-primary icon-spin" />
            <span className="text-xl font-bold text-flysafari-dark nav-link-highlight">
              FlySafari
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {[
              { path: "/flights", label: "Flights" },
              { path: "/offers", label: "Offers" },
              { path: "/my-bookings", label: "My Bookings" }
            ].map((item, index) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-item staggered-fade-in ${isActive(item.path) ? 'text-flysafari-primary font-semibold' : 'text-gray-700'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4 animate-fade-in">
            {renderAuthButtons()}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none hover-scale"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 animate-fade-in" />
              ) : (
                <Menu className="h-6 w-6 animate-fade-in" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-slide-in-right">
            {[
              { path: "/flights", label: "Flights" },
              { path: "/offers", label: "Offers" },
              { path: "/my-bookings", label: "My Bookings" }
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-2 nav-item staggered-fade-in ${isActive(item.path) ? 'text-flysafari-primary font-semibold' : 'text-gray-700'}`}
                onClick={toggleMenu}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
            {renderMobileAuthButtons()}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
