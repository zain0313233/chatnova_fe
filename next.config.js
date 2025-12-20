/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: NEXT_PUBLIC_* variables are automatically exposed to the browser
  // No need to manually add them to env object in Next.js
  // They are read directly from .env.local or .env files
};

module.exports = nextConfig;

