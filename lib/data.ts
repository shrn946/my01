import { getPrisma } from "@/lib/prisma";
import { heroSlides, posts, projects, reviews } from "@/lib/seed-data";

type CategoryLike = string | { name: string } | null | undefined;

type ProjectInput = {
  title: string;
  slug: string;
  category?: CategoryLike;
  description: string;
  overview: string;
  problem: string;
  solution: string;
  result: string;
  tools: string[];
  image: string;
  gallery: string[];
  liveUrl?: string | null;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProjectItem = Omit<ProjectInput, "category"> & {
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content: string;
  author: string;
  image: string;
  category?: CategoryLike;
  featured: boolean;
  publishedAt?: Date;
  readingTime?: string;
};

export type BlogPostItem = Omit<BlogPostInput, "category"> & {
  category: string;
  publishedAt: Date;
};

function normalizeCategory(category: CategoryLike, fallback = "WordPress") {
  return typeof category === "string" ? category : category?.name ?? fallback;
}

function normalizeProject(project: ProjectInput): ProjectItem {
  return {
    ...project,
    category: normalizeCategory(project.category),
    createdAt: project.createdAt ?? new Date(),
    updatedAt: project.updatedAt ?? new Date()
  };
}

function normalizePost(post: BlogPostInput): BlogPostItem {
  return {
    ...post,
    category: normalizeCategory(post.category),
    publishedAt: post.publishedAt ?? new Date()
  };
}

export async function getProjects(featured = false): Promise<ProjectItem[]> {
  try {
    const prisma = getPrisma();
    const data = await prisma.project.findMany({
      where: featured ? { featured: true } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });
    return data.length ? data.map(normalizeProject) : projects.map(normalizeProject);
  } catch {
    return projects.filter((project) => !featured || project.featured).map(normalizeProject);
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  try {
    const prisma = getPrisma();
    const project = await prisma.project.findUnique({ where: { slug }, include: { category: true } });
    return project ? normalizeProject(project) : projects.map(normalizeProject).find((item) => item.slug === slug) ?? null;
  } catch {
    return projects.map(normalizeProject).find((item) => item.slug === slug) ?? null;
  }
}

export async function getBlogPosts(featured = false): Promise<BlogPostItem[]> {
  try {
    const prisma = getPrisma();
    const data = await prisma.blogPost.findMany({
      where: featured ? { featured: true } : undefined,
      include: { category: true },
      orderBy: { publishedAt: "desc" }
    });
    return data.length ? data.map(normalizePost) : posts.map(normalizePost);
  } catch {
    return posts.filter((post) => !featured || post.featured).map(normalizePost);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    const prisma = getPrisma();
    const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
    return post ? normalizePost(post) : posts.map(normalizePost).find((item) => item.slug === slug) ?? null;
  } catch {
    return posts.map(normalizePost).find((item) => item.slug === slug) ?? null;
  }
}

export async function getReviews(featured = false) {
  try {
    const prisma = getPrisma();
    const data = await prisma.review.findMany({
      where: featured ? { featured: true, active: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return data.length ? data : reviews;
  } catch {
    return reviews.filter((review) => (!featured || review.featured) && review.active !== false);
  }
}

export async function getHeroSlides(activeOnly = true) {
  try {
    const prisma = getPrisma();
    const data = await prisma.heroSlide.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return data.length ? data : heroSlides.filter((slide) => !activeOnly || slide.active);
  } catch {
    return heroSlides.filter((slide) => !activeOnly || slide.active);
  }
}

export async function getInnerHeroSettings() {
  const fallback = {
    fallbackImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    overlayColor: "#07111f",
    overlayOpacity: 65,
    titleColor: "#ffffff",
    breadcrumbColor: "#dbeafe",
    heroHeight: 360,
    backgroundPosition: "center center",
    backgroundAttachment: "scroll"
  };

  try {
    const prisma = getPrisma();
    const settings = await prisma.innerHeroSettings.findFirst({ orderBy: { createdAt: "asc" } });
    return settings ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getContactMessages() {
  try {
    const prisma = getPrisma();
    return await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function getUsers() {
  try {
    const prisma = getPrisma();
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  } catch {
    return [];
  }
}

export async function getMediaAssets() {
  try {
    const prisma = getPrisma();
    return await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}
