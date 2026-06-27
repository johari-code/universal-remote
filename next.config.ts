import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },

  // Ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build
  eslint: {
    // !! WARN !!
    // This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // PWA Configuration - CRITICAL FOR SERVICE WORKER
  async headers() {
    return [
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
    ];
  },

  // Allow service worker to control all routes
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/service-worker.js",
          destination: "/service-worker.js",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
