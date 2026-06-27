// components/MobileNavigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Smartphone, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWA } from "@/contexts/PWAContext";

export function MobileNavigation() {
  const pathname = usePathname();
  const { isPWA, isMobile, safeAreaInsets } = usePWA();

  // ONLY show on PWA mobile - not on desktop or regular mobile browsing
  if (!isPWA || !isMobile) return null;

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/remotes",
      icon: Smartphone,
      label: "Remotes",
    },
    {
      href: "/playground",
      icon: Plus,
      label: "Create",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <div
    className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50"
    style={{
      paddingBottom: `${safeAreaInsets.bottom}px`,
    }}
    >
    <nav className="flex items-center justify-around h-16">
    {navItems.map((item) => {
      const Icon = item.icon;
      const isActive =
      pathname === item.href ||
      (item.href === "/remotes" && pathname.startsWith("/remotes"));

      return (
        <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all flex-1",
          isActive
          ? "text-blue-500"
          : "text-zinc-500 hover:text-zinc-300",
        )}
        >
        <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
        <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      );
    })}
    </nav>
    </div>
  );
}
