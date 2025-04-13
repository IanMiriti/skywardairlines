
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isLoaded || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("AdminRoute: Checking admin status for user:", user.id);
        
        // Check admin role from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          const isUserAdmin = data?.role === 'admin';
          console.log("User admin status:", isUserAdmin, "Data:", data);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [isLoaded, user]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }
  
  if (!isLoaded || !user) {
    console.log("User not loaded or not logged in, redirecting to sign-in");
    return <Navigate to="/sign-in" replace />;
  }
  
  if (!isAdmin) {
    console.log("User is not admin, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log("User is admin, rendering admin component");
  return <>{children}</>;
};

export default AdminRoute;
