// app/providers/ClerkPWAProvider.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from "react";

export function ClerkPWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detect if running as PWA
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isPWA) {
      // Store PWA state for Clerk to use
      sessionStorage.setItem("isPWA", "true");
    }
  }, []);

  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorBackground: "#09090b",
          colorText: "#fafafa",
          colorPrimary: "#2563eb",
          colorInputBackground: "#18181b",
          colorInputText: "#fafafa",
        },
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          card: "bg-zinc-900",
        },
      }}
      afterSignInUrl="/remotes"
      afterSignUpUrl="/remotes"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // Force Clerk to stay in same window for PWA
      routing="path"
      path="/"
    >
      {children}
    </ClerkProvider>
  );
}
