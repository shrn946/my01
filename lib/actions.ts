"use server";

import { revalidatePath } from "next/cache";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { hashPassword, requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readList(formData: FormData, key: string) {
  return readString(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function categoryIdFromName(name: string) {
  if (!name) return null;
  const prisma = getPrisma();
  const category = await prisma.category.upsert({
    where: { slug: slugify(name) },
    update: { name },
    create: { name, slug: slugify(name) }
  });
  return category.id;
}

async function uniqueSlug(model: "project" | "blogPost", baseSlug: string, currentId = "") {
  const prisma = getPrisma();
  const cleanBase = slugify(baseSlug) || "item";
  let slug = cleanBase;
  let index = 2;

  while (true) {
    const existing =
      model === "project"
        ? await prisma.project.findUnique({ where: { slug } })
        : await prisma.blogPost.findUnique({ where: { slug } });

    if (!existing || existing.id === currentId) return slug;
    slug = `${cleanBase}-${index}`;
    index += 1;
  }
}

export async function createContactMessage(_: unknown, formData: FormData) {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const projectType = readString(formData, "projectType");
  const budget = readString(formData, "budget");
  const message = readString(formData, "message");

  if (!name || !email || !projectType || !budget || !message) {
    return { ok: false, message: "Please complete all required fields." };
  }

  try {
    const prisma = getPrisma();
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: readString(formData, "phone"),
        projectType,
        budget,
        message
      }
    });
    revalidatePath("/admin");
    return { ok: true, message: "Thanks. Your message has been saved." };
  } catch {
    return { ok: false, message: "Database error. Check DATABASE_URL and Prisma migration." };
  }
}

export async function saveProject(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const title = readString(formData, "title");
  const categoryId = await categoryIdFromName(readString(formData, "category"));
  const slug = await uniqueSlug("project", readString(formData, "slug") || title, id);
  const data = {
    title,
    slug,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    description: readString(formData, "description"),
    overview: readString(formData, "overview"),
    problem: readString(formData, "problem"),
    solution: readString(formData, "solution"),
    result: readString(formData, "result"),
    tools: readList(formData, "tools"),
    image: readString(formData, "image"),
    gallery: readList(formData, "gallery"),
    liveUrl: readString(formData, "liveUrl") || null,
    featured: formData.get("featured") === "on"
  };

  if (id) await prisma.project.update({ where: { id }, data });
  else await prisma.project.create({ data });
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin");
}

export async function deleteProject(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.project.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/portfolio");
  revalidatePath("/admin");
}

export async function saveBlogPost(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const title = readString(formData, "title");
  const categoryId = await categoryIdFromName(readString(formData, "category"));
  const slug = await uniqueSlug("blogPost", readString(formData, "slug") || title, id);
  const data = {
    title,
    slug,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
    excerpt: readString(formData, "excerpt"),
    metaTitle: readString(formData, "metaTitle") || null,
    metaDescription: readString(formData, "metaDescription") || null,
    content: readString(formData, "content"),
    author: readString(formData, "author") || "Hassan",
    image: readString(formData, "image"),
    featured: formData.get("featured") === "on"
  };

  if (id) await prisma.blogPost.update({ where: { id }, data });
  else await prisma.blogPost.create({ data });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function deleteBlogPost(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.blogPost.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function saveReview(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const data = {
    client: readString(formData, "client"),
    image: readString(formData, "image") || null,
    company: readString(formData, "company"),
    country: readString(formData, "country"),
    rating: Number(readString(formData, "rating") || 5),
    text: readString(formData, "text"),
    platform: readString(formData, "platform"),
    service: readString(formData, "service") || null,
    sortOrder: Number(readString(formData, "sortOrder") || 0),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on"
  };

  if (id) await prisma.review.update({ where: { id }, data });
  else await prisma.review.create({ data });
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin");
}

export async function deleteReview(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.review.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/reviews");
  revalidatePath("/admin");
}

export async function savePortfolioExample(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const data = {
    category: readString(formData, "category"),
    title: readString(formData, "title"),
    url: readString(formData, "url"),
    thumbnail: readString(formData, "thumbnail"),
    description: readString(formData, "description")
  };

  if (id) await prisma.portfolioExample.update({ where: { id }, data });
  else await prisma.portfolioExample.create({ data });
  revalidatePath("/admin");
}

export async function deletePortfolioExample(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.portfolioExample.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/admin");
}

export async function saveHeroSlide(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const data = {
    title: readString(formData, "title"),
    subtitle: readString(formData, "subtitle"),
    buttonText: readString(formData, "buttonText"),
    buttonLink: readString(formData, "buttonLink") || "/contact",
    image: readString(formData, "image"),
    sortOrder: Number(readString(formData, "sortOrder") || 0),
    active: formData.get("active") === "on"
  };

  if (id) await prisma.heroSlide.update({ where: { id }, data });
  else await prisma.heroSlide.create({ data });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteHeroSlide(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.heroSlide.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function saveInnerHeroSettings(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const data = {
    fallbackImage: readString(formData, "fallbackImage"),
    overlayColor: readString(formData, "overlayColor") || "#07111f",
    overlayOpacity: Math.max(0, Math.min(100, Number(readString(formData, "overlayOpacity") || 65))),
    titleColor: readString(formData, "titleColor") || "#ffffff",
    breadcrumbColor: readString(formData, "breadcrumbColor") || "#dbeafe",
    heroHeight: Math.max(220, Math.min(720, Number(readString(formData, "heroHeight") || 360))),
    backgroundPosition: readString(formData, "backgroundPosition") || "center center",
    backgroundAttachment: readString(formData, "backgroundAttachment") === "fixed" ? "fixed" : "scroll"
  };

  const existing = await prisma.innerHeroSettings.findFirst();
  if (existing) await prisma.innerHeroSettings.update({ where: { id: existing.id }, data });
  else await prisma.innerHeroSettings.create({ data });

  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function saveUser(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const password = readString(formData, "password");
  const email = readString(formData, "email").toLowerCase();
  const role = readString(formData, "role") === "ADMIN" ? "ADMIN" : "CLIENT";

  if (!email) {
    throw new Error("Email address is required.");
  }

  if (!id && !password) {
    throw new Error("Password is required when creating a new user.");
  }

  const duplicate = await prisma.user.findUnique({ where: { email } });
  if (duplicate && duplicate.id !== id) {
    throw new Error("A user with this email address already exists.");
  }

  const data: {
    name: string | null;
    email: string;
    role: "ADMIN" | "CLIENT";
    password?: string;
  } = {
    name: readString(formData, "name") || null,
    email,
    role
  };

  if (password) {
    data.password = await hashPassword(password);
  }

  if (id) await prisma.user.update({ where: { id }, data });
  else await prisma.user.create({ data: { ...data, password: await hashPassword(password) } });
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  await prisma.user.delete({ where: { id: readString(formData, "id") } });
  revalidatePath("/admin");
}

export async function uploadMedia(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP, and GIF images are allowed.");
  }

  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const safeName = `${Date.now()}-${slugify(path.basename(file.name, extension))}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, bytes);

  await prisma.mediaAsset.create({
    data: {
      fileName: safeName,
      url: `/uploads/${safeName}`,
      mimeType: file.type,
      size: file.size,
      alt: readString(formData, "alt") || null
    }
  });

  revalidatePath("/admin");
}

export async function deleteMedia(formData: FormData) {
  await requireRole("ADMIN");
  const prisma = getPrisma();
  const id = readString(formData, "id");
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;

  const fullPath = path.join(process.cwd(), "public", asset.url);
  await prisma.mediaAsset.delete({ where: { id } });

  try {
    await unlink(fullPath);
  } catch {
    // The database record should still be removed if the physical file is already gone.
  }

  revalidatePath("/admin");
}
