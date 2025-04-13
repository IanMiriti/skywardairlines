
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get the publishable key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;

// Create console message function for debugging
const logEnvironmentStatus = () => {
  console.log("Environment variables status:");
  console.log("- VITE_CLERK_PUBLISHABLE_KEY:", PUBLISHABLE_KEY ? "✓ Present" : "✗ Missing");
  console.log("- VITE_CLERK_FRONTEND_API:", CLERK_FRONTEND_API ? "✓ Present (optional)" : "Not provided (optional)");
  
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

// Initialize app with or without Clerk
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    if (!PUBLISHABLE_KEY) {
      console.warn("Missing Clerk Publishable Key - Initializing app without authentication");
      
      // Render app without Clerk
      createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      // Show warning banner but still allow app to function
      const warningDiv = document.createElement('div');
      warningDiv.innerHTML = `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #fff3cd; color: #856404; padding: 10px; text-align: center; z-index: 9999; border-top: 1px solid #ffeeba;">
          Authentication is disabled: VITE_CLERK_PUBLISHABLE_KEY not set. Some features may not work.
        </div>
      `;
      document.body.appendChild(warningDiv);
    } else {
      console.log("Initializing application with Clerk publishable key");
      createRoot(rootElement).render(
        <React.StrictMode>
          <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/handle-auth"
            signUpFallbackRedirectUrl="/handle-auth"
            {...(CLERK_FRONTEND_API && { frontendApi: CLERK_FRONTEND_API })}
          >
            <App />
          </ClerkProvider>
        </React.StrictMode>
      );
      console.log("Application initialized successfully with authentication");
    }
  } catch (error) {
    console.error("Error initializing application:", error);
    
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
