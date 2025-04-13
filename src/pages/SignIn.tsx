
import { Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Only import Clerk if available
const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
let ClerkSignIn;

// Try to dynamically import Clerk components
if (isClerkAvailable) {
  try {
    // Use dynamic import to avoid direct dependency on Clerk
    ClerkSignIn = require("@clerk/clerk-react").SignIn;
  } catch (error) {
    console.error("Failed to load Clerk components:", error);
  }
}

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Clerk publishable key exists for debugging purposes
    const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (!hasClerkKey) {
      console.error("VITE_CLERK_PUBLISHABLE_KEY is missing. Authentication will not work properly.");
      setError("Authentication configuration is missing. Please contact support.");
    }
    setIsLoading(false);
  }, []);

  // Function to handle manual sign in (fallback when Clerk is not available)
  const handleManualSignIn = () => {
    console.log("Manual sign in - redirecting to dashboard");
    // For demo purposes, redirect to admin dashboard if using admin email
    const emailInput = document.getElementById("email") as HTMLInputElement;
    if (emailInput && emailInput.value === "ianmiriti254@gmail.com") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  // Render fallback sign-in form when Clerk is not available
  const renderFallbackSignIn = () => (
    <div className="flex flex-col gap-4">
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
        onClick={handleManualSignIn}
        className="bg-flysafari-primary hover:bg-flysafari-primary/90 text-white py-2 px-4 rounded mt-2"
      >
        Sign In
      </button>
      <p className="text-center text-sm text-gray-600 mt-2">
        Don't have an account?{" "}
        <Link to="/sign-up" className="text-flysafari-primary hover:underline font-medium">
          Sign up
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
          <h1 className="text-2xl font-bold text-flysafari-dark">Sign In</h1>
          <p className="text-gray-600 mt-2">
            Please sign in to access FlySafari.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mt-4">
              {error}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
          {isClerkAvailable && ClerkSignIn ? (
            <ClerkSignIn 
              routing="path" 
              path="/sign-in" 
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
            renderFallbackSignIn()
          )}
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Admin users will be redirected to the admin dashboard.
            Regular users will be redirected to the homepage.
          </p>
          <p className="mt-2">
            <strong>Admin Email:</strong> ianmiriti254@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
