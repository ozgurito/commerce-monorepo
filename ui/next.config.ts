import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '9000' },
      { protocol: 'http',  hostname: 'localhost', port: '8080' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
}

export default nextConfig
