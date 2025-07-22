/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options go here
  eslint: {
    // Enable ESLint checks during builds
    ignoreDuringBuilds: false,
  },
  // Enable TypeScript strict mode
  typescript: {
    // Enable TypeScript error checking during builds
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
