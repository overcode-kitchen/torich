import type { NextConfig } from "next";

const isApp = process.env.BUILD_TARGET === 'app';

const nextConfig: NextConfig = {
  ...(isApp && { 
    output: 'export',
  }),
  
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  
  images: {
    unoptimized: isApp,
    ...(!isApp && {
      formats: ["image/avif", "image/webp"],
    }),
  },
};

export default nextConfig;