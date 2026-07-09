import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  poweredByHeader: false,
  compress: true,
  images: {
    // During development, if remote image servers are slow or blocking local requests,
    // setting unoptimized: true can fix timeout (500) errors.
    unoptimized: process.env.NODE_ENV !== 'production',
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.staffbook.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://admin.staffbook.in/api/web/v1/:path*',
      },
      {
        source: '/resume-api/:path*',
        destination: 'https://resume.codekrafters.co.in/:path*',
      },
    ];
  },
};

export default nextConfig;
