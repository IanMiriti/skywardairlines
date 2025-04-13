
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-context";

type AuthRouteProps = {
  children: ReactNode;
};

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (isChecking) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-flysafari-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign-in page
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

export default AuthRoute;
