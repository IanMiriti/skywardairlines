
import { Plane } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Only import Clerk if available
const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
let SignUp;

// Try to dynamically import Clerk components
if (hasClerkKey) {
  try {
    // Use dynamic import to avoid direct dependency on Clerk
    SignUp = require("@clerk/clerk-react").SignUp;
  } catch (error) {
    console.error("Failed to load Clerk components:", error);
  }
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log the environment status for debugging
    console.log("Clerk publishable key present:", !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
    
    if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
      console.warn("VITE_CLERK_PUBLISHABLE_KEY is missing. Authentication will fall back to demo mode.");
      setError("Authentication is not available. Please contact the administrator.");
    }
    setIsLoading(false);
  }, []);

  // Function to handle manual sign up (fallback when Clerk is not available)
  const handleManualSignUp = () => {
    console.log("Manual sign up - redirecting to homepage");
    navigate("/");
  };

  // Render fallback sign-up form when Clerk is not available
  const renderFallbackSignUp = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="fullname" className="text-gray-700">
          Full Name
        </label>
        <input
          id="fullname"
          type="text"
          placeholder="Full Name"
          className="border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md p-2 border"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md p-2 border"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary rounded-md p-2 border"
        />
      </div>
      <button
        onClick={handleManualSignUp}
        className="bg-flysafari-primary hover:bg-flysafari-primary/90 text-white py-2 px-4 rounded mt-2"
      >
        Sign Up
      </button>
      <p className="text-center text-sm text-gray-600 mt-2">
        Already have an account?{" "}
        <Link to="/sign-in" className="text-flysafari-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <Plane className="h-8 w-8 text-flysafari-primary" />
            <span className="text-2xl font-bold text-flysafari-dark">FlySafari</span>
          </div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Create Your Account</h1>
          <p className="text-gray-600 mt-2">
            Join FlySafari to book flights and manage your trips.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-4">
              {error}
            </div>
          )}
          {!hasClerkKey && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-md mt-4">
              ❌ Authentication is not available - VITE_CLERK_PUBLISHABLE_KEY is not set.
              <p className="text-xs mt-1">Using demo mode instead.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
          {hasClerkKey && SignUp ? (
            <SignUp 
              routing="path" 
              path="/sign-up" 
              redirectUrl="/handle-auth"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none p-0 mx-auto w-full",
                  navbar: "hidden",
                  header: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-flysafari-primary hover:bg-flysafari-primary/90",
                  formFieldInput: "border-gray-300 focus:border-flysafari-primary focus:ring-flysafari-primary",
                  formFieldLabel: "text-gray-700",
                  identityPreview: "bg-gray-50 border-gray-200",
                  alert: "bg-red-50 border-red-100 text-red-600",
                  socialButtonsBlockButton: "bg-white border hover:bg-gray-50",
                  socialButtonsBlockButtonText: "text-gray-700"
                }
              }}
            />
          ) : (
            renderFallbackSignUp()
          )}
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link to="/sign-in" className="text-flysafari-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
