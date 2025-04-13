
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './hooks/use-theme.tsx';

// Get the publishable key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Create console message function for debugging
const logEnvironmentStatus = () => {
  console.log("Environment variables status:");
  console.log("- VITE_CLERK_PUBLISHABLE_KEY:", PUBLISHABLE_KEY ? "✓ Present" : "✗ Missing");
  
  // Log other important env variables if they exist
  if (import.meta.env.VITE_SUPABASE_URL) {
    console.log("- VITE_SUPABASE_URL: ✓ Present");
  }
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log("- VITE_SUPABASE_ANON_KEY: ✓ Present");
  }
  if (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
    console.log("- VITE_FLUTTERWAVE_PUBLIC_KEY: ✓ Present");
  }
};

// Log environment status for debugging
logEnvironmentStatus();

// Initialize app with Clerk (with improved error handling)
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    // We now assume Clerk should always be available in production (Netlify)
    const isProduction = import.meta.env.PROD;
    const isClerkMissing = !PUBLISHABLE_KEY;

    // Show a warning on screen for production if Clerk key is missing
    if (isProduction && isClerkMissing) {
      console.error("Missing Clerk Publishable Key in production environment");
      
      // Fallback to render without Clerk but with a clear error message
      createRoot(rootElement).render(
        <React.StrictMode>
          <ThemeProvider defaultTheme="light">
            <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
              Authentication error: Missing VITE_CLERK_PUBLISHABLE_KEY
            </div>
            <App />
          </ThemeProvider>
        </React.StrictMode>
      );
      return;
    }
    
    if (isClerkMissing) {
      console.warn("Missing Clerk Publishable Key - Initializing app without authentication (development mode)");
      
      // Initialize without Clerk but with a warning in development
      createRoot(rootElement).render(
        <React.StrictMode>
          <ThemeProvider defaultTheme="light">
            <App />
          </ThemeProvider>
        </React.StrictMode>
      );
    } else {
      console.log("Initializing application with Clerk authentication");
      
      // Initialize with Clerk
      createRoot(rootElement).render(
        <React.StrictMode>
          <ThemeProvider defaultTheme="light">
            <ClerkProvider 
              publishableKey={PUBLISHABLE_KEY}
              signInUrl="/sign-in"
              signUpUrl="/sign-up"
              signInFallbackRedirectUrl="/handle-auth"
              signUpFallbackRedirectUrl="/handle-auth"
            >
              <App />
            </ClerkProvider>
          </ThemeProvider>
        </React.StrictMode>
      );
      console.log("Application initialized successfully with authentication");
    }
  } catch (error) {
    console.error("Error initializing application:", error);
    
    // Show error on screen
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; font-family: 'Inter', sans-serif;">
          <h1 style="color: #EF4444; margin-bottom: 16px;">Application Error</h1>
          <p style="max-width: 500px; margin-bottom: 24px; color: #222;">
            There was an error initializing the application. Please check the console for more details.
          </p>
          <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; max-width: 600px; text-align: left; font-family: monospace; overflow: auto;">
            ${error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      `;
    }
  }
};

// Initialize the app
initializeApp();
