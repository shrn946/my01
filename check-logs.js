const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const logs = await prisma.emailLog.findMany({ orderBy: { sentAt: 'desc' }, take: 1 });
  console.log('Recent logs:', logs);
}
run().finally(() => prisma.$disconnect());