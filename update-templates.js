const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: 'Visual Design & SEO Proposal',
      subject: 'Strategy & Redesign Proposal for {businessName}',
      body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
  <div style="background-color: #6366f1; padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Digital Growth Strategy</h1>
    <p style="color: #e0e7ff; margin-top: 8px; font-size: 16px;">Prepared specifically for {businessName}</p>
  </div>
  
  <div style="padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px;">
    <p style="font-size: 18px; font-weight: 500; color: #0f172a;">Hi {businessName},</p>
    
    <p>I recently analyzed <strong>{website}</strong> and identified several key areas where we can significantly improve your conversion rates and search engine visibility.</p>
    
    <div style="margin: 32px 0; background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9;">
      <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Current Performance Snapshot</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 14px;">Overall Health:</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
            <span style="font-weight: bold; color: #6366f1;">{score}%</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b; font-size: 14px;">SEO Visibility:</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
            <span style="font-weight: bold; color: #10b981;">{seoScore}%</span>
          </td>
        </tr>
      </table>
    </div>

    {developerComments}

    <h3 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Recommended Improvements:</h3>
    {improvementProposals}

    {proposalPngImage}

    <div style="text-align: center; margin-top: 40px;">
      {reportLink}
      <p style="font-size: 14px; color: #64748b; margin-top: 16px;">Click the button above to view the full interactive audit.</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;" />
    
    <p style="font-size: 16px; margin-bottom: 8px;">Would you be open to a quick 10-minute strategy call next week to discuss these results?</p>
    <p style="font-weight: bold; color: #0f172a;">Best regards,<br/>{myName}</p>
  </div>
  
  <div style="text-align: center; padding: 24px; font-size: 12px; color: #94a3b8;">
    <p>Sent via Hassan's Growth Platform • No-Obligation Audit</p>
  </div>
</div>`
    },
    {
      name: 'Quick Wins & Performance',
      subject: 'Important: Performance & Speed Audit for {businessName}',
      body: `<div style="font-family: sans-serif; color: #334155; max-width: 600px; line-height: 1.6;">
  <h2>Performance Audit: {businessName}</h2>
  <p>Hi {businessName},</p>
  <p>I noticed that <strong>{website}</strong> is currently scoring <strong>{performanceScore}%</strong> on Google's Core Web Vitals. This might be causing you to lose potential customers who expect a faster experience.</p>
  
  <p>I've identified these quick wins to boost your speed and SEO:</p>
  {improvementProposals}
  
  <p>I've attached a detailed visual proposal for your review:</p>
  {proposalPngImage}
  
  <p>You can see the full breakdown here: {reportLink}</p>
  
  <p>Let me know if you'd like to fix these issues this week.</p>
  <p>Best,<br/>{myName}</p>
</div>`
    }
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: t.name },
      update: {
        subject: t.subject,
        body: t.body
      },
      create: {
        name: t.name,
        subject: t.subject,
        body: t.body
      }
    });
    console.log(`Updated template: ${t.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
