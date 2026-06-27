import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
                                         "/sign-up(.*)",
                                         "/manifest.json",
                                         "/service-worker.js",
                                         "/icons/(.*)",
                                         "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';

  // Better PWA detection - must be actual PWA, not just URL param
const isStandaloneMode = req.headers.get('sec-fetch-dest') === 'document' &&
req.headers.get('sec-fetch-mode') === 'navigate';
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
const hasPWAParam = url.searchParams.get('source') === 'pwa';
const hasPWACookie = req.cookies.get('pwa-mode')?.value === 'true';

// Only treat as PWA if it's mobile AND (has PWA indicators OR cookie)
const isPWARequest = isMobileDevice && (hasPWAParam || hasPWACookie || isStandaloneMode);

// Clean up non-PWA desktop requests that have source=pwa
if (!isMobileDevice && hasPWAParam) {
  url.searchParams.delete('source');
  return NextResponse.redirect(url);
}

// For true PWA requests, maintain context
if (isPWARequest) {
  const response = NextResponse.next();
  response.cookies.set('pwa-mode', 'true', {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
  });

  // Add PWA param if missing (only for mobile PWA)
  if (isMobileDevice && !url.searchParams.has('source')) {
    url.searchParams.set('source', 'pwa');
    return NextResponse.redirect(url);
  }
} else {
  // Clear PWA cookie if not in PWA mode
  const response = NextResponse.next();
  response.cookies.delete('pwa-mode');
}

// Handle authentication
if (!isPublicRoute(req)) {
  const authObject = await auth();

  if (!authObject.userId) {
    // Redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    const currentPath = url.pathname + url.search;
    signInUrl.searchParams.set('redirect_url', currentPath);

    // Only add source=pwa for actual PWA mobile requests
    if (isPWARequest) {
      signInUrl.searchParams.set('source', 'pwa');
    }

    const response = NextResponse.redirect(signInUrl);

    if (isPWARequest) {
      response.cookies.set('pwa-mode', 'true', {
        httpOnly: false,
        sameSite: 'strict',
        path: '/',
      });
    }

    return response;
  }
}

return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
