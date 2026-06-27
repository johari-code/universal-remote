"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PWAContextType {
  isPWA: boolean;
  isMobile: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const PWAContext = createContext<PWAContextType>({
  isPWA: false,
  isMobile: false,
  safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 20,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as PWA - ONLY actual PWA, not URL params on desktop
    const checkPWA = () => {
      // Primary checks for actual PWA mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isAndroidPWA = document.referrer.includes("android-app://");

      // Only consider URL param if we're also on mobile
      const hasPWAParam = new URLSearchParams(window.location.search).get("source") === "pwa";
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // True PWA detection - must be in standalone mode OR be mobile with PWA param
      return isStandalone || isIOSStandalone || isAndroidPWA || (hasPWAParam && isMobileDevice);
    };

    const pwaStatus = checkPWA();
    setIsPWA(pwaStatus);

    // Only store PWA status if actually in PWA mode
    if (pwaStatus) {
      sessionStorage.setItem("isPWA", "true");
      document.documentElement.classList.add("pwa-mode");
      document.body.classList.add("pwa-mode");
    } else {
      // Clear PWA state if not actually in PWA
      sessionStorage.removeItem("isPWA");
      document.documentElement.classList.remove("pwa-mode");
      document.body.classList.remove("pwa-mode");

      // Clean up URL if it has source=pwa but we're not in PWA mode
      const url = new URL(window.location.href);
      if (url.searchParams.has('source')) {
        url.searchParams.delete('source');
        window.history.replaceState({}, '', url.toString());
      }
    }

    // Check if mobile
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) && window.innerWidth < 768;
    };
    setIsMobile(checkMobile());

    // Calculate safe area insets (only for mobile)
    const updateSafeAreaInsets = () => {
      if (typeof document !== 'undefined' && checkMobile()) {
        const styles = getComputedStyle(document.documentElement);

        const getEnvValue = (property: string, fallback: string = "0") => {
          const value = styles.getPropertyValue(property);
          if (value && value !== '') {
            return parseInt(value.replace('px', ''), 10);
          }
          return parseInt(fallback, 10);
        };

        setSafeAreaInsets({
          top: getEnvValue('padding-top', '0'),
                          bottom: getEnvValue('padding-bottom', '20'),
                          left: getEnvValue('padding-left', '0'),
                          right: getEnvValue('padding-right', '0'),
        });
      }
    };

    updateSafeAreaInsets();

    // Listen for resize events
    const handleResize = () => {
      const newMobileStatus = checkMobile();
      setIsMobile(newMobileStatus);

      // Re-check PWA status on resize (in case of dev tools)
      const newPWAStatus = checkPWA();
      if (newPWAStatus !== pwaStatus) {
        setIsPWA(newPWAStatus);
      }

      updateSafeAreaInsets();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <PWAContext.Provider value={{ isPWA, isMobile, safeAreaInsets }}>
    {children}
    </PWAContext.Provider>
  );
}

export const usePWA = () => useContext(PWAContext);
