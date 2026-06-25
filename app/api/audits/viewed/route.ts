import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();
    if (!leadId) return new NextResponse("Missing leadId", { status: 400 });

    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return new NextResponse("Not found", { status: 404 });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Only send email notification if it hasn't been viewed in the last hour
    if (!lead.reportViewedAt || lead.reportViewedAt < oneHourAgo) {
      const settings = await prisma.settings.findUnique({ where: { id: "default" } });
      const resend = new Resend(settings?.resendApiKey || process.env.RESEND_API_KEY || "dummy_key");

      const companyName = settings?.companyName || "CoreWeb Labs";
      const siteUrl = settings?.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.coreweblabs.com";
      const leadUrl = `${siteUrl}/admin/leads/${lead.id}`;
      
      const senderName = settings?.senderName || companyName;
      const senderEmail = settings?.senderEmail || "notifications@coreweblabs.com";

      await resend.emails.send({
        from: `${senderName} <${senderEmail}>`,
        to: "hassannaqvi@coreweblabs.com",
        subject: `🔥 HOT LEAD: ${lead.businessName || lead.website} just viewed their report!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Report Viewed!</h2>
            <p><strong>${lead.businessName || lead.website}</strong> just opened their Web Audit Report.</p>
            <p>This is a great time to give them a call or send a quick follow-up message while they are "warm".</p>
            <br/>
            <a href="${leadUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Lead in Dashboard</a>
          </div>
        `
      }).catch(console.error); // fail silently if resend fails
    }

    // Always update the view count and last viewed time
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        reportViewedAt: now,
        reportViewCount: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
