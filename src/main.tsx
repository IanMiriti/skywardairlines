
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './hooks/use-theme.tsx';

// Log environment status for debugging
const logEnvironmentStatus = () => {
  console.log("Environment variables status:");
  
  // Log important env variables if they exist
  if (import.meta.env.VITE_SUPABASE_URL) {
    console.log("- VITE_SUPABASE_URL: ✓ Present");
  } else {
    console.log("- VITE_SUPABASE_URL: ✗ Missing");
  }
  
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log("- VITE_SUPABASE_ANON_KEY: ✓ Present");
  } else {
    console.log("- VITE_SUPABASE_ANON_KEY: ✗ Missing");
  }
  
  if (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
    console.log("- VITE_FLUTTERWAVE_PUBLIC_KEY: ✓ Present");
  }
};

// Log environment status for debugging
logEnvironmentStatus();

// Initialize app
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="light">
          <App />
        </ThemeProvider>
      </React.StrictMode>
    );
    console.log("Application initialized successfully");
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

// Initialize the app
initializeApp();
