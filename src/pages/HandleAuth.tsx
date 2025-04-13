
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HandleAuth = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user exists in profiles and their role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error checking user role:", error);
          navigate('/');
          return;
        }

        // Redirect based on role
        if (profile?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Error in auth redirection:", error);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkUserRole();
  }, [isLoaded, user, navigate]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-flysafari-dark">Redirecting you...</h1>
          <p className="text-gray-600 mt-2">Please wait while we verify your account.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default HandleAuth;
