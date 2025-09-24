/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled for build compatibility
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  // Environment variables for analytics (production only)
  env: {
    NEXT_PUBLIC_GA_ID: process.env.NODE_ENV === 'production' ? 'G-XXXXXXXXXX' : undefined,
  }
}

module.exports = nextConfig