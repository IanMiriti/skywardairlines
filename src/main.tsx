
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_bGVhcm5pbmctc25hcHBlci02LmNsZXJrLmFjY291bnRzLmRldiQ";

// Clerk redirect URLs - using the new recommended props instead of deprecated ones
const signInUrl = "/sign-in";
const signUpUrl = "/sign-up";
const fallbackRedirectUrl = "/handle-auth"; // Replaces afterSignInUrl/afterSignUpUrl

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      fallbackRedirectUrl={fallbackRedirectUrl}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
