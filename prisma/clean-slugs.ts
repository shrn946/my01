import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function uniqueBlogSlug(baseSlug: string, id: string) {
  const cleanBase = slugify(baseSlug) || "blog-post";
  let slug = cleanBase;
  let index = 2;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${cleanBase}-${index}`;
    index += 1;
  }
}

async function uniqueProjectSlug(baseSlug: string, id: string) {
  const cleanBase = slugify(baseSlug) || "project";
  let slug = cleanBase;
  let index = 2;

  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === id) return slug;
    slug = `${cleanBase}-${index}`;
    index += 1;
  }
}

async function main() {
  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    const nextSlug = await uniqueBlogSlug(post.slug || post.title, post.id);
    if (post.slug !== nextSlug) {
      await prisma.blogPost.update({ where: { id: post.id }, data: { slug: nextSlug } });
      console.log(`Blog: ${post.slug} -> ${nextSlug}`);
    }
  }

  const projects = await prisma.project.findMany();
  for (const project of projects) {
    const nextSlug = await uniqueProjectSlug(project.slug || project.title, project.id);
    if (project.slug !== nextSlug) {
      await prisma.project.update({ where: { id: project.id }, data: { slug: nextSlug } });
      console.log(`Project: ${project.slug} -> ${nextSlug}`);
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
