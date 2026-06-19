
import { getPrisma } from "./lib/prisma";

async function main() {
  const prisma = getPrisma();
  const categories = await prisma.category.findMany();
  console.log(JSON.stringify(categories, null, 2));
}

main();
