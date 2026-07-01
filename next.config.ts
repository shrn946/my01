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
    ],
    // Serve modern formats (AVIF first, then WebP) for significant size savings
    formats: ["image/avif", "image/webp"],
    // Breakpoints matching the layout's responsive grid
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [256, 384, 512, 640],
    // Cache optimized images for 7 days on the CDN (default is 60 s)
    minimumCacheTTL: 604800,
  }
};

export default nextConfig;
