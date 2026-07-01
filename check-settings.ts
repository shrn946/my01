import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  console.log("Current demoWebsiteUrls in DB:");
  console.log(settings?.demoWebsiteUrls || "None");
  await prisma.$disconnect();
}

main();
