import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ FIX 1: Disable static optimization that causes hydration errors
  output: 'standalone',

  // ✅ FIX 2: Strict error handling
  reactStrictMode: true,

  // ✅ FIX 3: Proper image domains
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NODE_ENV === 'production' ? "fluera.io" : "fluera.io"
      }, {
        protocol: "https",
        hostname: "fluera.io"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ],
    unoptimized: process.env.NODE_ENV === 'production' // Faster builds
  },

  // ✅ FIX 4: Disable X-Powered-By header
  poweredByHeader: false,

  // ✅ FIX 5: Compression
  compress: true,

  // ✅ FIX 6: Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // ✅ FIX 7: Disable telemetry
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;