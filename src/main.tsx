
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Clerk publishable key for production
const PUBLISHABLE_KEY = "pk_test_bGVhcm5pbmctc25hcHBlci02LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => window.location.href = to}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
