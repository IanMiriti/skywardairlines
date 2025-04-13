
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, AlertCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, isAdmin, isAdminLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isAdminLoading) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (!checkingAdmin) {
        // If user is logged in but not an admin, show error
        setError("You do not have admin privileges");
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges",
          variant: "destructive"
        });
      }
    }
  }, [user, isAdmin, isAdminLoading, navigate, checkingAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setIsSubmitting(true);
    setCheckingAdmin(true);
    setError(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Sign in error:", error);
        setError(error.message);
        setCheckingAdmin(false);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // We'll check admin status in the useEffect
        toast({
          title: "Signed in",
          description: "Checking admin privileges..."
        });
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err);
      setError("An unexpected error occurred. Please try again.");
      setCheckingAdmin(false);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <Plane className="h-8 w-8 text-flysafari-primary" />
            <span className="text-2xl font-bold text-flysafari-dark">FlySafari</span>
          </div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Admin Portal</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access the admin dashboard.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-4 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 transition-all hover:shadow-lg">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-gray-700" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded flex items-center justify-center transition-colors duration-200"
              disabled={isSubmitting || checkingAdmin}
            >
              {isSubmitting || checkingAdmin ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  {checkingAdmin ? "Verifying admin..." : "Signing in..."}
                </>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Note: Admin password is password123</p>
            <p className="mt-1">Default admin email: ianmiriti254@gmail.com</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <Link to="/auth" className="text-flysafari-primary hover:underline text-sm">
            Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
