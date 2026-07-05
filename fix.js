const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.update({ 
  where: { id: 'default' }, 
  data: { yelpEnabled: true, tomTomEnabled: true, apolloEnabled: true } 
}).then(() => console.log('Fixed')).finally(() => prisma.$disconnect());
