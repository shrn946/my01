
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany({ include: { category: true } });
  console.log(`Found ${projects.length} projects`);
  
  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} categories`);
  
  await prisma.$disconnect();
}

main();
