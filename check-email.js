const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 5
    });
    console.log("=== EMAIL LOGS ===");
    console.log(JSON.stringify(logs, null, 2));

    const settings = await prisma.settings.findUnique({
      where: { id: "default" }
    });
    console.log("\n=== SETTINGS ===");
    // Hide the actual key but show if it exists
    if (settings && settings.resendApiKey) {
        settings.resendApiKey = settings.resendApiKey ? "*** HIDDEN ***" : null;
    }
    console.log(JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();