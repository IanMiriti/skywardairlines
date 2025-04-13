
import { UserButton, useUser } from "@clerk/clerk-react";
import { Bell, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminHeader = () => {
  const { user, isLoaded } = useUser();
  const [adminName, setAdminName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching admin profile:', error);
          } else if (data) {
            setAdminName(data.full_name);
          }
        } catch (error) {
          console.error('Error fetching admin profile:', error);
        }
      }
    };
    
    fetchAdminProfile();
  }, [user]);
  
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
        
        <div className="flex items-center">
          {isLoaded && user && (
            <span className="text-sm font-medium mr-2">
              {adminName || user.firstName || user.username}
            </span>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
