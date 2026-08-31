/** @type {import('next').NextConfig} */
const nextConfig = {
  // API proxy: Next.js server-side code calls NestJS at API_INTERNAL_URL
  // The browser NEVER sees this URL — it's a server-side env var only
  async rewrites() {
    return [];
  },
  // Strict mode for better React error detection in dev
  reactStrictMode: true,
};

module.exports = nextConfig;
