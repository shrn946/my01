
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  
  console.log("Deleting existing categories...");
  await prisma.category.deleteMany({});
  
  const newCategories = [
    "Dentists",
    "Law Firms",
    "Roofing Companies",
    "HVAC Companies",
    "Plumbing Companies",
    "Medical Clinics"
  ];
  
  console.log("Creating new categories...");
  for (const name of newCategories) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.category.create({
      data: { name, slug }
    });
  }
  
  console.log("Categories updated successfully.");
  await prisma.$disconnect();
}

main();
