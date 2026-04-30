import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Lokal geliştirme (MinIO / Spring)
      { protocol: 'http',  hostname: 'localhost', port: '9000' },
      { protocol: 'http',  hostname: 'localhost', port: '8080' },
      // AWS S3
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // Cloudflare R2 / custom CDN
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Genel HTTPS (production CDN)
      { protocol: 'https', hostname: '**.alisverisnoktam.com' },
    ],
  },
  // Vercel için output default (server), Docker için standalone
  // output: 'standalone',

  // API proxy — backend CORS sorunlarını önler (isteğe bağlı)
  // async rewrites() {
  //   return [
  //     { source: '/api/:path*', destination: `${process.env.API_URL}/api/:path*` },
  //   ]
  // },
}

export default nextConfig
