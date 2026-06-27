import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";
import { PWAProvider } from "@/contexts/PWAContext";
import { MobileNavigation } from "@/components/MobileNavigation";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Universal IR Remote - Custom Remote Control Designer",
  description: "Design and use your custom remote controls for any device",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RemoteForge",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  applicationName: "RemoteForge Controller",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          // Force Clerk to open in same window for PWA
          rootBox: "pwa-clerk-root",
          formContainer: "pwa-clerk-form",
      },
    }}
    afterSignInUrl="/remotes"
    afterSignUpUrl="/remotes"
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    // CRITICAL: Force Clerk to use path routing to stay in PWA context
    routing="path"
    path="/"
    >
    <html lang="en">
    <head>
    {/* PWA Meta Tags */}
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
    name="apple-mobile-web-app-status-bar-style"
    content="black-translucent"
    />
    <meta name="mobile-web-app-capable" content="yes" />

    {/* Critical script to preserve PWA context */}
    <script
    dangerouslySetInnerHTML={{
      __html: `
      // Immediately store PWA state
      (function() {
        if (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator && window.navigator.standalone) ||
          document.referrer.includes('android-app://') ||
          window.location.search.includes('source=pwa')) {
          sessionStorage.setItem('isPWA', 'true');
        document.documentElement.classList.add('pwa-mode');
          }

          // Override window.open to prevent breaking out of PWA
          const originalOpen = window.open;
          window.open = function(url, target, features) {
            if (sessionStorage.getItem('isPWA') === 'true' && target === '_blank') {
              // Force same window for PWA
              window.location.href = url;
              return window;
            }
            return originalOpen.call(window, url, target, features);
          };
      })();
      `,
    }}
    />
    </head>
    <body
    className={`${spaceGrotesk.variable} ${spaceGrotesk.className} bg-zinc-950`}
    >
    <PWAProvider>
    <div className="pwa-container">
    {children}
    <MobileNavigation />
    </div>
    </PWAProvider>
    <Toaster position="bottom-right" />

    {/* Enhanced PWA Service Worker Registration */}
    <script
    dangerouslySetInnerHTML={{
      __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/service-worker.js').then(
            function(registration) {
              console.log('ServiceWorker registration successful');

              // Ensure PWA classes are applied
              if (window.matchMedia('(display-mode: standalone)').matches ||
                sessionStorage.getItem('isPWA') === 'true') {
                document.documentElement.classList.add('pwa-mode');
              document.body.classList.add('pwa-mode');
                }
            },
            function(err) {
              console.log('ServiceWorker registration failed: ', err);
            }
          );
        });
      }

      // Prevent links from opening in browser
      document.addEventListener('click', function(e) {
        if (sessionStorage.getItem('isPWA') === 'true') {
          const link = e.target.closest('a');
          if (link && link.target === '_blank') {
            e.preventDefault();
            window.location.href = link.href;
          }
        }
      });
      `,
    }}
    />
    </body>
    </html>
    </ClerkProvider>
  );
}
