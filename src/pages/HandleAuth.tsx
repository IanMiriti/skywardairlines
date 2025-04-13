
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
        console.log("HandleAuth: Checking role for user:", user.id, user.primaryEmailAddress?.emailAddress);
        
        // Admin email shortcut - if email matches admin email, redirect directly to admin dashboard
        if (user.primaryEmailAddress?.emailAddress === 'ianmiriti254@gmail.com') {
          console.log("Admin email detected, redirecting to admin dashboard");
          
          // Ensure profile exists with admin role
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', user.id)
            .maybeSingle();
            
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
            navigate('/');
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
