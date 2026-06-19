
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const projects = await prisma.project.findMany({ include: { category: true } });
  
  projects.forEach(p => {
    console.log(`Project: ${p.title}, Category: ${p.category?.name}`);
  });
  
  await prisma.$disconnect();
}

main();
