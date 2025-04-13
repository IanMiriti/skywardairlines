
import { UserButton } from "@clerk/clerk-react";
import { Bell, Settings } from "lucide-react";

const AdminHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-flysafari-dark">
        Admin Dashboard
      </h1>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-flysafari-primary transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-gray-500 hover:text-flysafari-primary transition-colors">
          <Settings size={20} />
        </button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
};

export default AdminHeader;
