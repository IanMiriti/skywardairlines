
import React from 'react';
import { createRoot } from 'react-dom/client';
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
    // Safe approach: pre-load Clerk IF key is available before rendering app
    if (PUBLISHABLE_KEY) {
      console.log("Attempting to initialize Clerk with publishable key");
      // Pre-check if Clerk module is available
      import('@clerk/clerk-react')
        .then(({ ClerkProvider }) => {
          console.log("Clerk module loaded successfully");
          
          // Initialize with Clerk
          createRoot(rootElement).render(
            <React.StrictMode>
              <ThemeProvider defaultTheme="light">
                <ClerkProvider 
                  publishableKey={PUBLISHABLE_KEY}
                  afterSignInUrl="/handle-auth"
                  afterSignUpUrl="/handle-auth"
                  signInUrl="/sign-in"
                  signUpUrl="/sign-up"
                >
                  <App />
                </ClerkProvider>
              </ThemeProvider>
            </React.StrictMode>
          );
          console.log("Application initialized successfully with Clerk authentication");
        })
        .catch(error => {
          console.error("Failed to load Clerk, initializing without authentication:", error);
          // Fallback to render without Clerk
          initializeWithoutClerk(rootElement);
        });
    } else {
      console.warn("Missing Clerk Publishable Key - Initializing app without authentication");
      initializeWithoutClerk(rootElement);
    }
  } catch (error) {
    console.error("Error initializing application:", error);
    
    // Fallback for serious errors
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

// Helper function to initialize app without Clerk
const initializeWithoutClerk = (rootElement) => {
  console.log("Initializing application without Clerk");
  createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  console.log("Application initialized without authentication");
};

// Initialize the app
initializeApp();
