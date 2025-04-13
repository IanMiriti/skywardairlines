
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Clerk publishable key
// Using environment variable only, with no fallback that would expose the key in the code
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Clerk redirect URLs
// According to the Clerk dashboard settings, redirectUrl should be /handle-auth
const signInUrl = "/sign-in";
const signUpUrl = "/sign-up";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

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
