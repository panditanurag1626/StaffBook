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
    const rules = [
      {
        source: '/api/proxy/:path*',
        destination: 'https://admin.staffbook.in/api/web/v1/:path*',
      },
    ];
    if (process.env.NODE_ENV === 'production') {
      // Production: forward ALL resume-api to Vercel
      rules.push({
        source: '/resume-api/:path*',
        destination: 'https://resume-pro-ebon.vercel.app/:path*',
      });
    } else {
      // Dev: only template previews go to Vercel (real designs), rest local
      rules.push({
        source: '/resume-api/api/templates/:id/preview',
        destination: 'https://resume-pro-ebon.vercel.app/api/templates/:id/preview',
      });
    }
    return rules;
  },
};

export default nextConfig;
