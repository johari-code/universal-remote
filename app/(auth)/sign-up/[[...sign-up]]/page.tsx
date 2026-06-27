// app/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve PWA state through sign-up
    const isPWA = searchParams?.get("source") === "pwa" ||
    sessionStorage.getItem("isPWA") === "true";

    if (isPWA) {
      sessionStorage.setItem("isPWA", "true");
      document.documentElement.classList.add("pwa-mode");
      document.body.classList.add("pwa-mode");
    }
  }, [searchParams]);

  // Get redirect URL, preserving PWA context
  const redirectUrl = searchParams?.get("redirect_url") || "/remotes";
  const finalRedirectUrl = sessionStorage.getItem("isPWA") === "true"
  ? `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}source=pwa`
  : redirectUrl;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <SignUp
    appearance={{
      baseTheme: undefined,
      variables: {
        colorBackground: "#18181b",
        colorText: "#fafafa",
        colorPrimary: "#2563eb",
        colorInputBackground: "#09090b",
        colorInputText: "#fafafa",
      },
      elements: {
        formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          card: "bg-zinc-900 border border-zinc-800",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 hover:bg-zinc-700 border-zinc-700",
          formFieldLabel: "text-zinc-400",
            formFieldInput: "bg-zinc-950 border-zinc-800 text-zinc-100",
              footerActionLink: "text-blue-500 hover:text-blue-400",
              // Prevent external windows
              identityPreviewEditButton: "hidden",
              otpCodeFieldInput: "bg-zinc-950 border-zinc-800 text-zinc-100",
      },
    }}
    redirectUrl={finalRedirectUrl}
    signInUrl="/sign-in"
    routing="path"
    path="/sign-up"
    // Force to stay in same window
    forceRedirectUrl={finalRedirectUrl}
    />
    </div>
  );
}
