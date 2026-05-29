import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel.storage' },
      { protocol: 'https', hostname: 'public.blob.vercel.storage' },
    ],
  },
};

export default nextConfig;
