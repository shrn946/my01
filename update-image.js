const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.project.update({
    where: { slug: 'manor-dental-centre' },
    data: { image: '/portfolio-screenshots/manordentalcentre.png' }
  });
  console.log("Image updated!");
}

main().finally(() => prisma.$disconnect());
