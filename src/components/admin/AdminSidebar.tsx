
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Plane, 
  Tag, 
  BookOpen, 
  AlertTriangle,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Check if Clerk is available
const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Only import Clerk hooks if available
const ClerkComponents = isClerkAvailable
  ? require("@clerk/clerk-react")
  : { useClerk: () => ({ signOut: (callback: () => void) => callback() }) };

const { useClerk } = ClerkComponents;

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useClerk();
  
  const handleSignOut = async () => {
    // Sign out from Supabase first
    await supabase.auth.signOut();
    
    // Then sign out from Clerk if available
    if (isClerkAvailable) {
      signOut(() => {
        window.location.href = "/sign-in";
      });
    } else {
      // If Clerk is not available, just redirect
      window.location.href = "/sign-in";
    }
  };
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      title: "Flights",
      path: "/admin/flights",
      icon: <Plane size={20} />
    },
    {
      title: "Offers",
      path: "/admin/offers",
      icon: <Tag size={20} />
    },
    {
      title: "Bookings",
      path: "/admin/bookings",
      icon: <BookOpen size={20} />
    },
    {
      title: "Cancellations",
      path: "/admin/cancellations",
      icon: <AlertTriangle size={20} />
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <aside className="bg-skyward-dark text-white w-64 min-h-screen flex flex-col shadow-lg animate-fade-in">
      <div className="p-5 border-b border-gray-700">
        <Link to="/admin/dashboard" className="flex items-center gap-2 hover-scale">
          <Plane className="h-6 w-6 text-skyward-secondary" />
          <span className="text-xl font-bold">Skyward Express Admin</span>
        </Link>
      </div>
      
      <nav className="flex-grow p-5">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={item.title} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-skyward-primary/20 text-white"
                    : "text-gray-300 hover:bg-skyward-dark/90 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="text-white">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-5 border-t border-gray-700">
        <Link to="/" className="flex items-center gap-3 w-full px-4 py-3 mb-2 rounded-md text-gray-300 hover:bg-skyward-secondary/10 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="text-white">Back to Homepage</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="text-white">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
