
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Plane, 
  Tag, 
  BookOpen, 
  AlertTriangle,
  LogOut
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useClerk();
  
  const handleSignOut = () => {
    signOut(() => {
      window.location.href = "/";
    });
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
    <aside className="bg-flysafari-dark text-white w-64 min-h-screen flex flex-col shadow-lg">
      <div className="p-5 border-b border-gray-700">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-flysafari-secondary" />
          <span className="text-xl font-bold">FlySafari Admin</span>
        </Link>
      </div>
      
      <nav className="flex-grow p-5">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-flysafari-primary/20 text-white"
                    : "text-gray-300 hover:bg-flysafari-dark/90 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-5 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
