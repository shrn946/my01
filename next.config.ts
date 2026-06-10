import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"]
};

export default nextConfig;
