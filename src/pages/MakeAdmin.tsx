
import { useState } from "react";
import { makeEmailAdmin } from "@/integrations/supabase/makeAdmin";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle } from "lucide-react";

const MakeAdmin = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const handleMakeAdmin = async () => {
    setIsProcessing(true);
    try {
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
      } else {
        toast({
          title: "Error",
          description: "Failed to make your account an admin. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
