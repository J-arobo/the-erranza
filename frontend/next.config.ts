import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allowing images from unsplash.com */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },


};

export default nextConfig;
