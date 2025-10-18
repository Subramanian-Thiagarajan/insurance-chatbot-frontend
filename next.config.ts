import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Configure the body size limit for all Server Actions
      bodySizeLimit: '30mb', // Adjust this value
    },
  },
};

export default nextConfig;
