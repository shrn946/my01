
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany();
  console.log(JSON.stringify(categories, null, 2));
  await prisma.$disconnect();
}

main();
