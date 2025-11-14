/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  transpilePackages: ['@creepjs/core', '@creepjs/sdk'],
  images: {
    unoptimized: true,
  },
  // Remove rewrites for static export (not supported)
  // Client will call API directly using NEXT_PUBLIC_API_URL
};

export default nextConfig;
