

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Flights from "./pages/Flights";
import FlightDetails from "./pages/FlightDetails";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Offers from "./pages/Offers";
import OfferDetails from "./pages/OfferDetails";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import HandleAuth from "./pages/HandleAuth";
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
import { supabase } from "./integrations/supabase/client";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/offers" element={<Offers />} />
            <Route path="/offers/:id" element={<OfferDetails />} />
            <Route path="/unauthorized" element={<NotFound />} />
            <Route path="/handle-auth" element={<HandleAuth />} />
            
            {/* Protected customer routes */}
            <Route 
              path="/my-bookings" 
              element={
                <>
                  <SignedIn>
                    <MyBookings />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <>
                  <SignedIn>
                    <Profile />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              } 
            />
            
            {/* Authentication routes */}
            <Route path="/sign-in/*" element={<SignIn />} />
            <Route path="/sign-up/*" element={<SignUp />} />
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
  </QueryClientProvider>
);

export default App;

