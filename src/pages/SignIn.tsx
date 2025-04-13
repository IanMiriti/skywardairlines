
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { toast } from "@/hooks/use-toast";

const SignInPage = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Sign in error:", error);
        setError(error.message);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log("Sign in successful");
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err);
      setError("An unexpected error occurred. Please try again.");
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
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <Plane className="h-8 w-8 text-flysafari-primary" />
            <span className="text-2xl font-bold text-flysafari-dark">FlySafari</span>
          </div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Sign In</h1>
          <p className="text-gray-600 mt-2">
            Please sign in to access FlySafari.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-4 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-flysafari-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
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
            
            <div>
              <button
                type="submit"
                className="w-full bg-flysafari-primary hover:bg-flysafari-primary/90 text-white py-2 px-4 rounded flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-flysafari-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
