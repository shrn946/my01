import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { heroSlides, posts, projects, reviews } from "../lib/seed-data";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function category(name: string) {
  return prisma.category.upsert({
    where: { slug: slugify(name) },
    update: {},
    create: { name, slug: slugify(name) }
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: await bcrypt.hash(adminPassword, 12)
    },
    create: {
      name: "Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN"
    }
  });

  const existingHeroSettings = await prisma.innerHeroSettings.findFirst();
  if (!existingHeroSettings) {
    await prisma.innerHeroSettings.create({
      data: {
        fallbackImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
        overlayColor: "#07111f",
        overlayOpacity: 65,
        titleColor: "#ffffff",
        breadcrumbColor: "#dbeafe",
        heroHeight: 360,
        backgroundPosition: "center center",
        backgroundAttachment: "scroll"
      }
    });
  }

  for (const item of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({ where: { title: item.title } });
    if (existing) {
      await prisma.heroSlide.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.heroSlide.create({ data: item });
    }
  }

  for (const item of projects) {
    const cat = await category(item.category);
    await prisma.project.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        category: { connect: { id: cat.id } },
        description: item.description,
        overview: item.overview,
        problem: item.problem,
        solution: item.solution,
        result: item.result,
        tools: item.tools,
        image: item.image,
        gallery: item.gallery,
        liveUrl: item.liveUrl,
        featured: item.featured
      },
      create: {
        title: item.title,
        slug: item.slug,
        category: { connect: { id: cat.id } },
        description: item.description,
        overview: item.overview,
        problem: item.problem,
        solution: item.solution,
        result: item.result,
        tools: item.tools,
        image: item.image,
        gallery: item.gallery,
        liveUrl: item.liveUrl,
        featured: item.featured
      }
    });
  }

  for (const item of posts) {
    const cat = await category(item.category);
    await prisma.blogPost.upsert({
      where: { slug: item.slug },
      update: {
        excerpt: item.excerpt,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        content: item.content,
        image: item.image,
        featured: item.featured
      },
      create: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        content: item.content,
        author: item.author,
        image: item.image,
        category: { connect: { id: cat.id } },
        featured: item.featured
      }
    });
  }

  for (const item of reviews) {
    const existing = await prisma.review.findFirst({
      where: { client: item.client, company: item.company }
    });

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: item
      });
    } else {
      await prisma.review.create({
        data: item
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
