const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
  console.log('yelpEnabled:', settings.yelpEnabled);
  console.log('yelpApiKey:', settings.yelpApiKey ? 'set' : 'not set');
  console.log('yelpSearchLimit:', settings.yelpSearchLimit);
  console.log('apolloEnabled:', settings.apolloEnabled);
  console.log('tomTomEnabled:', settings.tomTomEnabled);
  
  const todayStr = new Date().toLocaleDateString("en-CA");
  const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
  console.log('yelpCount:', usage?.yelpCount || 0);
}
check().finally(() => prisma.$disconnect());
