
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-context";
import { toast } from "@/hooks/use-toast";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isAdminLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      console.log("AdminRoute: No authenticated user, redirecting to sign-in");
      navigate("/auth/admin");
    }
    
    if (!isAdminLoading && user && !isAdmin) {
      console.log("User is not admin, showing error");
      setError("You do not have administrative privileges");
      
      toast({
        title: "Access Denied",
        description: "You do not have administrative privileges",
        variant: "destructive"
      });
    }
  }, [loading, user, isAdmin, isAdminLoading, navigate]);
  
  if (loading || isAdminLoading) {
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
  
  if (!user) {
    console.log("User not loaded or not logged in, redirecting to admin sign-in");
    return <Navigate to="/auth/admin" replace />;
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
