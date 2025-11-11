/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@creepjs/core', '@creepjs/sdk'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8787/:path*',
      },
    ];
  },
};

export default nextConfig;
