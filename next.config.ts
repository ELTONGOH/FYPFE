import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL, 
  },
  images: {
    domains: [
      'potato-trade.s3.ap-southeast-1.amazonaws.com',
    ],
  },
};

export default nextConfig;
