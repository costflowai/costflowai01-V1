/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For static export if needed
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // Ensure trailing slashes for Netlify
  trailingSlash: true,

  // Image optimization
  images: {
    unoptimized: true
  }
}

export default nextConfig