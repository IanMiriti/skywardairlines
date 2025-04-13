
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Clerk publishable key
// For development environments, provide a fallback
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  (import.meta.env.DEV ? 'pk_test_placeholder_for_development' : undefined);

// Clerk redirect URLs
// According to the Clerk dashboard settings, redirectUrl should be /handle-auth
const signInUrl = "/sign-in";
const signUpUrl = "/sign-up";

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key - Please set VITE_CLERK_PUBLISHABLE_KEY environment variable");
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
      <h1 style="color: #e53e3e; margin-bottom: 16px;">Configuration Error</h1>
      <p style="max-width: 500px; margin-bottom: 24px;">
        Missing Clerk Publishable Key. Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable.
      </p>
      <p style="font-size: 14px; color: #718096;">
        For development: Set this in your .env.local file or directly in your development environment.
      </p>
    </div>
  `;
  // Don't throw error - render a helpful message instead
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        signInUrl={signInUrl}
        signUpUrl={signUpUrl}
        signInFallbackRedirectUrl="/handle-auth"
        signUpFallbackRedirectUrl="/handle-auth"
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
