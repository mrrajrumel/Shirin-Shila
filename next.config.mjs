/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['framer-motion', 'lucide-react'],
  serverExternalPackages: ['mysql2', 'bcryptjs', 'sharp'],
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Link',
            value: '</api/markdown>; rel="alternate"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="service-desc"',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
      { source: '/filmography', destination: '/#filmography', permanent: true },
      { source: '/works', destination: '/#filmography', permanent: true },
      { source: '/projects', destination: '/#filmography', permanent: true },
      { source: '/press', destination: '/#press', permanent: true },
    ];
  },
};

export default nextConfig;
