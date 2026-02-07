import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    // 브라우저 지원 여부를 확인하고 포맷 순서대로 변환
    // 1순위: avif (최강 압축), 2순위: webp (표준 압축)
    formats: ["image/avif", "image/webp"],
    // 로컬 이미지 패턴 (query string 허용: 캐시 무효화용 ?v= 등)
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/icons/**" },
    ],
  },
};

export default nextConfig;
