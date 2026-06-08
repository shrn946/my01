import type { MetadataRoute } from "next";
import { getBlogPosts, getProjects } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [projects, posts] = await Promise.all([getProjects(), getBlogPosts()]);
  const staticRoutes = ["", "/about", "/services", "/portfolio", "/blog", "/reviews", "/contact"];

  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...projects.map((project) => ({ url: `${base}/portfolio/${project.slug}`, lastModified: new Date(project.updatedAt) })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: new Date(post.publishedAt) }))
  ];
}
