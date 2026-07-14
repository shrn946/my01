import { getPrisma } from "@/lib/prisma";
import { heroSlides, posts, projects, reviews } from "@/lib/seed-data";
import { unstable_cache } from "next/cache";

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

export type ReviewItem = {
  id?: string;
  client: string;
  image?: string | null;
  company: string;
  country: string;
  rating: number;
  text: string;
  platform: string;
  service?: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
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

export async function getBlogPosts(featured = false): Promise<BlogPostItem[]> {
  return unstable_cache(
    async () => {
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
    },
    [`blog-posts-${featured}`],
    { tags: ["blog"], revalidate: 604800 }
  )();
}

export async function getBlogPostsByCategory(categoryName: string): Promise<BlogPostItem[]> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const data = await prisma.blogPost.findMany({
          where: { category: { name: { equals: categoryName, mode: 'insensitive' } } },
          include: { category: true },
          orderBy: { publishedAt: "desc" }
        });
        return data.map(normalizePost);
      } catch {
        return posts.filter(p => normalizeCategory(p.category).toLowerCase() === categoryName.toLowerCase()).map(normalizePost);
      }
    },
    [`blog-posts-category-${categoryName}`],
    { tags: ["blog"], revalidate: 604800 }
  )();
}

export async function getRelatedBlogPosts(currentSlug: string, categoryName: string, limit = 3): Promise<BlogPostItem[]> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const data = await prisma.blogPost.findMany({
          where: {
            slug: { not: currentSlug },
            category: { name: categoryName }
          },
          take: limit,
          include: { category: true },
          orderBy: { publishedAt: "desc" }
        });
        
        if (data.length < limit) {
          const moreData = await prisma.blogPost.findMany({
            where: {
              slug: { notIn: [currentSlug, ...data.map(p => p.slug)] }
            },
            take: limit - data.length,
            include: { category: true },
            orderBy: { publishedAt: "desc" }
          });
          return [...data.map(normalizePost), ...moreData.map(normalizePost)];
        }
        return data.map(normalizePost);
      } catch {
        return posts
          .filter(p => p.slug !== currentSlug)
          .slice(0, limit)
          .map(normalizePost);
      }
    },
    [`related-blog-posts-${currentSlug}`],
    { tags: ["blog"], revalidate: 604800 }
  )();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
        return post ? normalizePost(post) : posts.map(normalizePost).find((item) => item.slug === slug) ?? null;
      } catch {
        return posts.map(normalizePost).find((item) => item.slug === slug) ?? null;
      }
    },
    [`blog-post-${slug}`],
    { tags: ["blog"], revalidate: 604800 }
  )();
}

export async function getProjects(featured = false): Promise<ProjectItem[]> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const data = await prisma.project.findMany({
          where: featured ? { featured: true } : undefined,
          include: { category: true },
          orderBy: { createdAt: "desc" }
        });
        const dbProjects = data.map(normalizeProject);
        const seedProjects = projects.filter((project) => !featured || project.featured).map(normalizeProject);
        const dbSlugs = new Set(dbProjects.map(p => p.slug));
        const missingSeed = seedProjects.filter(p => !dbSlugs.has(p.slug));
        return [...dbProjects, ...missingSeed];
      } catch {
        return projects.filter((project) => !featured || project.featured).map(normalizeProject);
      }
    },
    [`projects-${featured}`],
    { tags: ["projects"], revalidate: 604800 }
  )();
}

export async function getProjectsByCategory(categoryName: string): Promise<ProjectItem[]> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const data = await prisma.project.findMany({
          where: { category: { name: { equals: categoryName, mode: 'insensitive' } } },
          include: { category: true },
          orderBy: { createdAt: "desc" }
        });
        const dbProjects = data.map(normalizeProject);
        const seedProjects = projects
          .filter(p => normalizeCategory(p.category).toLowerCase() === categoryName.toLowerCase())
          .map(normalizeProject);
        const dbSlugs = new Set(dbProjects.map(p => p.slug));
        const missingSeed = seedProjects.filter(p => !dbSlugs.has(p.slug));
        return [...dbProjects, ...missingSeed];
      } catch {
        return projects.filter(p => normalizeCategory(p.category).toLowerCase() === categoryName.toLowerCase()).map(normalizeProject);
      }
    },
    [`projects-category-${categoryName}`],
    { tags: ["projects"], revalidate: 604800 }
  )();
}

export async function getRelatedProjects(currentSlug: string, categoryName: string, limit = 3): Promise<ProjectItem[]> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const data = await prisma.project.findMany({
          where: {
            slug: { not: currentSlug },
            category: { name: categoryName }
          },
          take: limit,
          include: { category: true },
          orderBy: { createdAt: "desc" }
        });
        
        if (data.length < limit) {
          const moreData = await prisma.project.findMany({
            where: {
              slug: { notIn: [currentSlug, ...data.map(p => p.slug)] }
            },
            take: limit - data.length,
            include: { category: true },
            orderBy: { createdAt: "desc" }
          });
          return [...data.map(normalizeProject), ...moreData.map(normalizeProject)];
        }
        return data.map(normalizeProject);
      } catch {
        return projects
          .filter(p => p.slug !== currentSlug)
          .slice(0, limit)
          .map(normalizeProject);
      }
    },
    [`related-projects-${currentSlug}`],
    { tags: ["projects"], revalidate: 604800 }
  )();
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const project = await prisma.project.findUnique({ where: { slug }, include: { category: true } });
        return project ? normalizeProject(project) : projects.map(normalizeProject).find((item) => item.slug === slug) ?? null;
      } catch {
        return projects.map(normalizeProject).find((item) => item.slug === slug) ?? null;
      }
    },
    [`project-${slug}`],
    { tags: ["projects"], revalidate: 604800 }
  )();
}

export async function getReviews(featured = false): Promise<ReviewItem[]> {
  return unstable_cache(
    async () => {
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
    },
    [`reviews-${featured}`],
    { tags: ["reviews"], revalidate: 604800 }
  )();
}

export async function getPortfolioExamples() {
  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        return await prisma.portfolioExample.findMany({
          orderBy: { createdAt: "desc" }
        });
      } catch {
        return [];
      }
    },
    ["portfolio-examples"],
    { tags: ["portfolio"], revalidate: 604800 }
  )();
}

export async function getHeroSlides(activeOnly = true) {
  return unstable_cache(
    async () => {
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
    },
    [`hero-slides-${activeOnly}`],
    { tags: ["hero"], revalidate: 604800 }
  )();
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

  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const settings = await prisma.innerHeroSettings.findFirst({ orderBy: { createdAt: "asc" } });
        return settings ?? fallback;
      } catch {
        return fallback;
      }
    },
    ["inner-hero-settings"],
    { tags: ["settings"], revalidate: 604800 }
  )();
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

export async function getMenuSettings() {
  const DEFAULT_MENU = [
    { id: "home", label: "Home", href: "/", visible: true },
    { id: "about", label: "About", href: "/about", visible: true },
    { id: "services", label: "Services", href: "/services", visible: true },
    { id: "portfolio", label: "Portfolio", href: "/portfolio", visible: true },
    { 
      id: "blog-dropdown",
      label: "Blog", 
      href: "/blog",
      visible: true,
      children: [
        { id: "articles", label: "Articles", href: "/blog", visible: true },
        { id: "videos", label: "Videos", href: "/videos", visible: true }
      ]
    },
    { id: "reviews", label: "Reviews", href: "/reviews", visible: true },
    { id: "contact", label: "Contact", href: "/contact", visible: true }
  ];

  return unstable_cache(
    async () => {
      try {
        const prisma = getPrisma();
        const settings = await prisma.settings.findUnique({ where: { id: "default" } });
        return (settings?.navItems as any) ?? DEFAULT_MENU;
      } catch {
        return DEFAULT_MENU;
      }
    },
    ["menu-settings"],
    { tags: ["settings"], revalidate: 604800 }
  )();
}
