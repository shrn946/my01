const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templateName = 'Visual Design & SEO Proposal';
  const existing = await prisma.emailTemplate.findFirst({
    where: { name: templateName }
  });

  const subject = 'Website Audit & Design Proposal for {businessName}';
  const body = `Hi {businessName},

I recently conducted a comprehensive audit of {website} and noticed some significant opportunities to enhance both its performance and visual appeal.

As we move into a more visual and speed-dependent web, I've prepared a full UI/UX and Technical proposal for you.

Here is a summary of your current metrics:
• Performance: {performanceScore}%
• SEO: {seoScore}%
• Design & UX: {designScore}%

{proposalPngImage}

I specialize in modernizing websites to increase lead generation and search visibility. Based on your site, I recommend:
{improvementProposals}

You can view your full detailed report here:
{reportLink}

Would you be open to a 10-minute strategy call to discuss how we can implement these improvements?

Best regards,
{myName}`;

  if (existing) {
    await prisma.emailTemplate.update({
      where: { id: existing.id },
      data: { subject, body }
    });
    console.log('Updated existing template.');
  } else {
    await prisma.emailTemplate.create({
      data: {
        name: templateName,
        subject,
        body
      }
    });
    console.log('Created new template.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
