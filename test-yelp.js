const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
  const apiKey = settings.yelpApiKey;
  const location = "New York, NY";
  const query = "plumber";
  const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=5`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  console.log(res.status, await res.text());
}
test().finally(() => prisma.$disconnect());