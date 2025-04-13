
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const NotFound = () => {
  const location = useLocation();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "User authenticated:", 
      isLoaded ? (user ? "Yes" : "No") : "Loading"
    );
  }, [location.pathname, user, isLoaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-flysafari-dark">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-gray-500 mb-6">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-flysafari-primary hover:bg-flysafari-primary/90 text-white py-2 px-4 rounded transition-colors"
          >
            Return to Home
          </Link>
          {!user && isLoaded && (
            <Link 
              to="/sign-in" 
              className="block w-full bg-white border border-flysafari-primary text-flysafari-primary hover:bg-gray-50 py-2 px-4 rounded transition-colors"
            >
              Sign In
            </Link>
          )}
          {user && isLoaded && (
            <Link 
              to="/handle-auth" 
              className="block w-full bg-white border border-flysafari-primary text-flysafari-primary hover:bg-gray-50 py-2 px-4 rounded transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
