"use client";

import { Benefits } from "@/components/sections/benefits";
import { BentoGrid } from "@/components/sections/bento";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { FeatureHighlight } from "@/components/sections/feature-highlight";
import { FeatureScroll } from "@/components/sections/feature-scroll";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePWA } from "@/contexts/PWAContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function HomeContent() {
  const { user, isLoaded } = useUser();
  const { isPWA, isMobile, safeAreaInsets } = usePWA();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only redirect in PWA mode when authenticated - not on desktop!
  useEffect(() => {
    // ONLY redirect if we're actually in PWA mode (not just desktop with source=pwa)
    if (isPWA && isMobile && isLoaded && user) {
      // Don't redirect if we just came from sign-in
      const fromSignIn = searchParams?.get('__clerk_db_jwt') ||
      searchParams?.get('__clerk_created_session');

      if (!fromSignIn) {
        router.replace("/remotes");
      }
    }
  }, [isPWA, isMobile, isLoaded, user, router, searchParams]);

  // PWA Mobile View - ONLY show this if actually in PWA on mobile
  if (isPWA && isMobile) {
    if (!isLoaded) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
        </div>
      );
    }

    if (!user) {
      // PWA Sign-in prompt
      return (
        <div
        className="min-h-screen bg-zinc-950 flex flex-col"
        style={{ paddingTop: `${safeAreaInsets.top}px` }}
        >
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
        <h1 className="text-3xl font-bold text-zinc-100">Universal IR remote</h1>
        <p className="text-zinc-400">
        Sign in to access your custom remotes
        </p>
        <div className="space-y-3">
        <Link
        href="/sign-in?redirect_url=/remotes"
        className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
        Sign In
        </Link>
        <Link
        href="/sign-up?redirect_url=/remotes"
        className="block w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
        Create Account
        </Link>
        </div>
        </div>
        </div>
        </div>
      );
    }

    // Redirecting...
    return null;
  }

  // Regular Desktop/Mobile Web View - Show for all non-PWA browsing
  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
    {/* Regular Header - Always show on desktop/non-PWA mobile */}
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur">
    <div className="flex items-center gap-8">
    <Link href="/" className="text-lg font-semibold text-zinc-100">
    Universal IR Remote
    </Link>
    <nav className="hidden md:flex items-center gap-6">
    <Link
    href="/playground"
    className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors"
    >
    Playground
    </Link>
    <Link
    href="/remotes"
    className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors"
    >
    My Remotes
    </Link>
    </nav>
    </div>

    <div className="flex items-center gap-4">
    {isLoaded && user ? (
      <>
      <Link
      href="/playground"
      className={cn(
        buttonVariants({ variant: "default", size: "sm" }),
                    "bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
      )}
      >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Create Remote</span>
      </Link>
      <UserButton afterSignOutUrl="/" />
      </>
    ) : (
      <div className="flex items-center gap-3">
      <Link
      href="/sign-in"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-zinc-400 hover:text-zinc-100"
      )}
      >
      Sign In
      </Link>
      <Link
      href="/sign-up"
      className={cn(
        buttonVariants({ variant: "default", size: "sm" }),
                    "bg-blue-600 hover:bg-blue-700 text-white"
      )}
      >
      Get Started
      </Link>
      </div>
    )}
    </div>
    </header>

    {/* Main Content */}
    <main className="relative flex-1">
    <Hero />
    </main>

    {/* Separator Line */}
    <div className="w-full h-[1px] bg-white/30" />

    {/* Footer */}
    <footer className="bg-zinc-950 py-6">
    <div className="container mx-auto px-1">
    <p className="text-center text-sm text-zinc-600 font-mono">
    @universal-remote 2026 - All rights reserved. 
    </p>
    </div>
    </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500">Loading...</div>
      </div>
    }>
    <HomeContent />
    </Suspense>
  );
}
