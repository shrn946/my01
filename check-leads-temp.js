const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.lead.findUnique({
    where: { id: 'cmqsw0z370006jm041vn3fdx8' }
  });
  console.log("Lead cmqsw0z370006jm041vn3fdx8:", lead ? lead.businessName + " | " + lead.reportStatus : "Not Found");
  
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Latest leads:");
  leads.forEach(l => console.log(l.id, l.businessName, l.reportStatus));
}

main().catch(console.error).finally(() => prisma.$disconnect());
