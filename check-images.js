const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const lead = await prisma.lead.findFirst({ orderBy: { createdAt: 'desc' } });
  console.log('Lead images:', {
    proposal: lead?.proposalImage,
    desktop: lead?.desktopImage
  });
}
run().finally(() => prisma.$disconnect());