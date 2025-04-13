
import { useState } from "react";
import { makeEmailAdmin } from "@/integrations/supabase/makeAdmin";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MakeAdmin = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleMakeAdmin = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // First try the regular method
      const result = await makeEmailAdmin("ianmiriti254@gmail.com");
      
      if (result) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: "Your account has been granted admin privileges.",
        });
        
        // Redirect after a short delay to see the success message
        setTimeout(() => {
          navigate("/auth/admin");
        }, 3000);
        return;
      } 
      
      // If the regular method failed, try direct database update
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          throw new Error("Could not get current user");
        }
        
        const userId = userData.user.id;
        
        // Try to get the profile first
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'ianmiriti254@gmail.com')
          .maybeSingle();
          
        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', existingProfile.id);
            
          if (updateError) throw updateError;
        } else {
          // Insert new profile with admin role
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: 'ianmiriti254@gmail.com',
              role: 'admin',
              full_name: 'Admin User'
            });
            
          if (insertError) throw insertError;
        }
        
        setSuccess(true);
        toast({
          title: "Success!",
          description: "Your account has been granted admin privileges using direct method.",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/auth/admin");
        }, 3000);
      } catch (directError: any) {
        console.error("Direct admin creation error:", directError);
        setError(`Database error: ${directError.message || 'Unknown error'}`);
        toast({
          title: "Error",
          description: `Direct method failed: ${directError.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error making admin:", error);
      setError(`${error.message || 'An unexpected error occurred'}`);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {!success ? (
          <>
            <Shield className="mx-auto h-16 w-16 text-flysafari-primary mb-4" />
            <h1 className="text-2xl font-bold mb-4">Make Your Account Admin</h1>
            <p className="text-gray-600 mb-6">
              Click the button below to make your account (ianmiriti254@gmail.com) an admin.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-left">
                <p className="font-medium">Error encountered:</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-2">Trying alternative direct method. Click the button again.</p>
              </div>
            )}
            <button
              onClick={handleMakeAdmin}
              disabled={isProcessing}
              className="bg-flysafari-primary hover:bg-flysafari-primary/90 text-white px-6 py-2 rounded-md flex items-center justify-center w-full"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Grant Admin Privileges
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Success!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been granted admin privileges. You will be redirected to the admin login page shortly.
            </p>
            <button
              onClick={() => navigate("/auth/admin")}
              className="bg-flysafari-primary hover:bg-flysafari-primary/90 text-white px-6 py-2 rounded-md w-full"
            >
              Go to Admin Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MakeAdmin;
