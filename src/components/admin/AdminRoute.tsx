
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isLoaded) {
        console.log("AdminRoute: User data not loaded yet");
        return;
      }
      
      if (!user) {
        console.log("AdminRoute: No authenticated user, redirecting to sign-in");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("AdminRoute: Checking admin status for user:", user.id, "Email:", user.primaryEmailAddress?.emailAddress);
        
        // Check if user is the admin email directly first
        if (user.primaryEmailAddress?.emailAddress === 'ianmiriti254@gmail.com') {
          console.log("User has admin email, granting admin access directly");
          
          // Ensure admin role is saved in database
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileCheckError) {
            console.error("Error checking profile:", profileCheckError);
          } else if (!existingProfile) {
            console.log("Admin user not in database, creating profile");
            await supabase
              .from('profiles')
              .insert({ 
                id: user.id,
                full_name: user.fullName || '',
                avatar_url: user.imageUrl || '',
                role: 'admin'
              });
          } else if (existingProfile.role !== 'admin') {
            console.log("Updating user role to admin in database");
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
          }
          
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // Also check if the role is set in publicMetadata
        const userRole = user.publicMetadata?.role;
        if (userRole === 'admin') {
          console.log("User has admin role in Clerk metadata");
          
          // Sync with Supabase
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileCheckError) {
            console.error("Error checking profile:", profileCheckError);
          } else if (!existingProfile) {
            console.log("Admin user not in database, creating profile");
            await supabase
              .from('profiles')
              .insert({ 
                id: user.id,
                full_name: user.fullName || '',
                avatar_url: user.imageUrl || '',
                role: 'admin'
              });
          } else if (existingProfile.role !== 'admin') {
            console.log("Updating user role to admin in database");
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
          }
          
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // Check admin role from Supabase as backup
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking admin role:', error);
          setError("Database error: " + error.message);
          setIsAdmin(false);
        } else {
          const isUserAdmin = data?.role === 'admin';
          console.log("User admin status from database:", isUserAdmin, "Data:", data);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError("Error checking admin status: " + (error instanceof Error ? error.message : String(error)));
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-flysafari-dark">Checking admin access...</h1>
          <p className="text-gray-600 mt-2">Please wait while we verify your permissions.</p>
        </div>
      </div>
    );
  }
  
  if (!isLoaded || !user) {
    console.log("User not loaded or not logged in, redirecting to sign-in");
    return <Navigate to="/sign-in" replace />;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-flysafari-dark mb-2">Admin Access Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-flysafari-primary hover:bg-flysafari-primary/90 text-white px-4 py-2 rounded"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    console.log("User is not admin, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log("User is admin, rendering admin component");
  return <>{children}</>;
};

export default AdminRoute;
