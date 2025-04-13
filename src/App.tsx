
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./hooks/auth-context";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Flights from "./pages/Flights";
import FlightDetails from "./pages/FlightDetails";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";
import Offers from "./pages/Offers";
import OfferDetails from "./pages/OfferDetails";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import RootLayout from "./components/layouts/RootLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFlights from "./pages/admin/Flights";
import AdminEditFlight from "./pages/admin/EditFlight";
import AdminOffers from "./pages/admin/Offers";
import AdminEditOffer from "./pages/admin/EditOffer";
import AdminBookings from "./pages/admin/Bookings";
import AdminCancellations from "./pages/admin/Cancellations";
import AdminUsers from "./pages/admin/Users";
import AdminRoute from "./components/admin/AdminRoute";
import AuthRoute from "./components/AuthRoute";
import AuthRoleSelect from "./pages/AuthRoleSelect";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import AdminAuthPage from "./pages/AdminAuthPage";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Log app initialization for debugging
  useEffect(() => {
    console.log("App component initialized");
    
    // Check Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error("Supabase connection error:", error.message);
        } else {
          console.log("Supabase connection successful");
        }
      } catch (err) {
        console.error("Supabase check failed:", err);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<RootLayout />}>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/flights/:id" element={<FlightDetails />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/booking/:id/confirmation" element={<BookingConfirmation />} />
                <Route path="/payment/:bookingId" element={<Payment />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/offers/:id" element={<OfferDetails />} />
                <Route path="/unauthorized" element={<NotFound />} />
                
                {/* Protected customer routes */}
                <Route 
                  path="/my-bookings" 
                  element={
                    <AuthRoute>
                      <MyBookings />
                    </AuthRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <AuthRoute>
                      <Profile />
                    </AuthRoute>
                  } 
                />
                
                {/* Authentication routes */}
                <Route path="/auth" element={<AuthRoleSelect />} />
                <Route path="/auth/customer" element={<CustomerAuthPage />} />
                <Route path="/auth/admin" element={<AdminAuthPage />} /> 
                <Route path="/sign-in" element={<Navigate to="/auth/customer" replace />} />
                <Route path="/sign-up" element={<Navigate to="/auth/customer" replace />} />
              </Route>
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="flights" element={<AdminFlights />} />
                <Route path="flights/new" element={<AdminEditFlight />} />
                <Route path="flights/:id/edit" element={<AdminEditFlight />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="offers/new" element={<AdminEditOffer />} />
                <Route path="offers/:id/edit" element={<AdminEditOffer />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="cancellations" element={<AdminCancellations />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
