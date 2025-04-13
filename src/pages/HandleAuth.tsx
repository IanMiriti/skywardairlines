
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HandleAuth = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded) {
        console.log("HandleAuth: User data not loaded yet");
        return;
      }
      
      if (!user) {
        console.log("HandleAuth: No authenticated user found");
        navigate('/sign-in');
        setIsChecking(false);
        return;
      }

      try {
        console.log("HandleAuth: Checking role for user:", user.id, user.primaryEmailAddress?.emailAddress);
        
        // Admin email shortcut - if email matches admin email, redirect directly to admin dashboard
        if (user.primaryEmailAddress?.emailAddress === 'ianmiriti254@gmail.com') {
          console.log("Admin email detected, redirecting to admin dashboard");
          
          // Ensure profile exists with admin role
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error checking existing profile:", profileError);
            setError("Database error: " + profileError.message);
          }
            
          if (!existingProfile) {
            console.log("Creating admin profile for admin email");
            // Create admin profile if it doesn't exist
            const { error: createError } = await supabase
              .from('profiles')
              .insert({ 
                id: user.id,
                full_name: user.fullName || '',
                avatar_url: user.imageUrl || '',
                role: 'admin'
              });
              
            if (createError) {
              console.error("Error creating admin profile:", createError);
              setError("Database error: " + createError.message);
            }
          } else if (existingProfile.role !== 'admin') {
            console.log("Updating existing profile to admin role");
            // Update to admin role if profile exists but not admin
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
              
            if (updateError) {
              console.error("Error updating to admin role:", updateError);
              setError("Database error: " + updateError.message);
            }
          }
          
          navigate('/admin/dashboard');
          setIsChecking(false);
          return;
        }
        
        // Check if user exists in profiles and their role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking user role:", error);
          setError("Database error: " + error.message);
          
          // If the user doesn't exist in the profiles table, create a new profile
          const isAdmin = user.primaryEmailAddress?.emailAddress === 'ianmiriti254@gmail.com';
          console.log("Creating new profile, isAdmin:", isAdmin);

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id,
              full_name: user.fullName || '',
              avatar_url: user.imageUrl || '',
              role: isAdmin ? 'admin' : 'user'
            })
            .select('role')
            .single();
            
          if (createError) {
            console.error("Error creating new profile:", createError);
            setError("Database error: " + createError.message);
            navigate('/');
            setIsChecking(false);
            return;
          }
          
          console.log("Created new profile with role:", newProfile?.role);
          
          if (newProfile?.role === 'admin') {
            console.log("Redirecting new admin to admin dashboard");
            navigate('/admin/dashboard');
          } else {
            console.log("Redirecting new user to homepage");
            navigate('/');
          }
          setIsChecking(false);
          return;
        }

        // Redirect based on role
        if (profile?.role === 'admin') {
          console.log("User is admin, redirecting to admin dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("User is not admin, redirecting to home page");
          navigate('/');
        }
      } catch (error) {
        console.error("Error in auth redirection:", error);
        setError("Authentication error: " + (error instanceof Error ? error.message : String(error)));
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-flysafari-dark mb-2">Authentication Error</h1>
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

  return null;
};

export default HandleAuth;
