
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

// Check if Clerk is available
const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Only import Clerk components if available
const ClerkComponents = isClerkAvailable
  ? require("@clerk/clerk-react")
  : { 
      SignUp: () => <div>Authentication is disabled. Please set VITE_CLERK_PUBLISHABLE_KEY.</div> 
    };

const { SignUp: ClerkSignUp } = ClerkComponents;

const SignUp = () => {
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
        </div>
        
        {isClerkAvailable ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
            <ClerkSignUp 
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
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
            <div className="p-6 text-center">
              <div className="text-amber-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Authentication Disabled</h2>
              <p className="text-gray-600 mb-4">
                The authentication service is not configured. Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable.
              </p>
              <Link 
                to="/" 
                className="block w-full bg-flysafari-primary hover:bg-flysafari-primary/90 text-white py-2 px-4 rounded transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <a href="/sign-in" className="text-flysafari-primary hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
