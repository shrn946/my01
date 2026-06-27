const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.lead.findUnique({
    where: { id: 'cmqsw0z370006jm041vn3fdx8' },
    include: { emailLogs: true }
  });
  console.log("Lead cmqsw0z370006jm041vn3fdx8 email:", lead ? lead.email : "Not Found");
  console.log("Email logs:", lead ? lead.emailLogs : []);
}

main().catch(console.error).finally(() => prisma.$disconnect());
