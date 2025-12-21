/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: NEXT_PUBLIC_* variables are automatically exposed to the browser
  // No need to manually add them to env object in Next.js
  // They are read directly from .env.local or .env files
  
  // Headers for Google OAuth (fixes COOP error)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

