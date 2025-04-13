
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Plane } from "lucide-react";

const SignIn = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <Plane className="h-8 w-8 text-flysafari-primary" />
            <span className="text-2xl font-bold text-flysafari-dark">FlySafari</span>
          </div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Sign In to Your Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Please sign in to access your bookings.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
          <ClerkSignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
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
              }
            }}
          />
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <a href="/sign-up" className="text-flysafari-primary hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
