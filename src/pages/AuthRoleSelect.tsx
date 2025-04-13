
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";

export default function AuthRoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <Plane className="h-8 w-8 text-flysafari-primary" />
            <span className="text-2xl font-bold text-flysafari-dark">FlySafari</span>
          </div>
          <h1 className="text-2xl font-bold text-flysafari-dark">Sign in as</h1>
          <p className="text-gray-600 mt-2">
            Please select your account type to continue.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/auth/customer")}
              className="bg-flysafari-primary text-white px-6 py-3 rounded-lg hover:bg-flysafari-primary/90 transition"
            >
              I'm a Customer
            </button>
            <button
              onClick={() => navigate("/auth/admin")}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              I'm an Admin
            </button>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-flysafari-primary hover:underline text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
