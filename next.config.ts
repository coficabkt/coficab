/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true, // For future use with server actions if needed
  },
  images: {
    domains: [], // Add domains here if you use external images
  },
  env: {
    // Expose environment variables to the browser if needed
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
