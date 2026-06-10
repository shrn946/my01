import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.emailTemplate.count();
  if (count === 0) {
    await prisma.emailTemplate.createMany({
      data: [
        {
          name: 'Standard Audit Proposal',
          subject: 'Website Audit Results for {businessName}',
          body: 'Hi there,\n\nI recently ran a performance and SEO audit on {website} and noticed a few areas where you could significantly improve your online presence.\n\nHere is a quick summary of your scores:\n- Overall Score: {score}%\n- Performance: {performanceScore}%\n- SEO: {seoScore}%\n- Accessibility: {accessibilityScore}%\n\nI specialize in helping businesses like yours fix these exact issues to drive more traffic and conversions.\n\nWould you be open to a brief chat this week to discuss how we can improve these metrics?\n\nBest regards,\n[Your Name]'
        },
        {
          name: 'Performance Focused',
          subject: 'Speed issues on {website}',
          body: 'Hello,\n\nI was browsing {website} today and noticed it was taking a bit longer to load than it should. I ran a quick technical audit and found that your Performance score is currently at {performanceScore}%.\n\nSlow websites often lead to lost customers and lower search engine rankings. The good news is that these issues are usually straightforward to fix.\n\nI would love to send over the full report and offer some quick wins you can implement. Let me know if you are interested!\n\nCheers,\n[Your Name]'
        }
      ]
    });
    console.log('Seeded default templates.');
  } else {
    console.log('Templates already exist.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect() });
