/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ebiz/libs'],
  // Configure image domains if needed
  images: {
    domains: ['placehold.co', 'lh3.googleusercontent.com'],
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/:path*',
      },
      {
        source: '/api/onboarding/:path*',
        destination: 'http://localhost:3000/onboarding/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig; 