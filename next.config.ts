import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium",
    "playwright",
    "playwright-core"
  ],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/playwright-core/browsers.json"]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
