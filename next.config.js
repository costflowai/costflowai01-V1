/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom']
  },

  // Environment variables for analytics (production only)
  env: {
    NEXT_PUBLIC_GA_ID: process.env.NODE_ENV === 'production' ? 'G-XXXXXXXXXX' : undefined,
  }
}

export default nextConfig