
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Get the publishable key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;

// Check if key is available
if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key - Please set VITE_CLERK_PUBLISHABLE_KEY environment variable");
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; font-family: 'Inter', sans-serif;">
      <h1 style="color: #8B5CF6; margin-bottom: 16px;">Configuration Error</h1>
      <p style="max-width: 500px; margin-bottom: 24px; color: #222;">
        Missing Clerk Publishable Key. Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable.
      </p>
      <p style="font-size: 14px; color: #8E9196;">
        You can get your publishable key from the <a href="https://dashboard.clerk.com/last-active?path=api-keys" target="_blank" style="color: #F97316;">Clerk Dashboard</a>.
      </p>
    </div>
  `;
  // Don't render the app if the key is missing
} else {
  createRoot(document.getElementById("root")!).render(
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
}

