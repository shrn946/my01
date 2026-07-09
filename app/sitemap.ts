import type { MetadataRoute } from "next";
import { getBlogPosts, getProjects } from "@/lib/data";
import videosData from "@/lib/videos.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.coreweblabs.com";
  
  // Fetch dynamic content in parallel with fallback to empty arrays to prevent failing sitemap generation
  const [projects, posts] = await Promise.all([
    getProjects().catch(() => []),
    getBlogPosts().catch(() => [])
  ]);

  // Static routes with specific SEO priorities and change frequencies
  const staticRoutes: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" },
    { path: "/portfolio", priority: 0.9, changeFrequency: "daily" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/reviews", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/videos", priority: 0.9, changeFrequency: "daily" }
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as any,
    priority: route.priority
  }));

  const projectUrls = projects.map((project) => ({
    url: `${base}/portfolio/${project.slug}`,
    lastModified: new Date(project.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const postUrls = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const videoUrls = (videosData || []).map((video) => ({
    url: `${base}/videos/${video.slug}`,
    lastModified: video.date ? new Date(video.date) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  return [
    ...staticUrls,
    ...projectUrls,
    ...postUrls,
    ...videoUrls
  ];
}


