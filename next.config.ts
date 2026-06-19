import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium",
    "playwright",
    "playwright-core"
  ],
  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/playwright-core/browsers.json",
      "./node_modules/@sparticuz/chromium/bin/**/*"
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "xnkghknmgshmvxhrwtxw.supabase.co" }
    ]
  }
};

export default nextConfig;
