import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    // Temporarily disable ESLint during builds for testing
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable type checking during builds for testing
    ignoreBuildErrors: true,
  },
};

export default nextConfig;