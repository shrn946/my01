const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.lead.findUnique({
    where: { id: 'cmq7adq4b0001uwm85t6xxhs6' }
  });
  console.log(JSON.stringify(lead, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
