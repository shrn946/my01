import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core"
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  outputFileTracingIncludes: {
    "/dashboard/**/*": [
      "./node_modules/playwright-core/browsers.json"
    ],
    "/api/**/*": [
      "./node_modules/playwright-core/browsers.json"
    ]
  },
  outputFileTracingExcludes: {
    "/**/*": [
      "./node_modules/@swc/core/**/*",
      "./node_modules/esbuild/**/*",
      "./node_modules/terser/**/*",
      "./node_modules/rollup/**/*",
      "./node_modules/@napi-rs/**/*"
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "xnkghknmgshmvxhrwtxw.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" }
    ]
  }
};

export default nextConfig;
