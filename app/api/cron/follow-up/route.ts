import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendLeadEmail } from "@/lib/email-actions";

export const maxDuration = 300; // 5 minutes max

export async function GET(request: Request) {
  // Optional: Verify chron secret if process.env.CRON_SECRET exists
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    
    if (!settings?.followUpEnabled) {
      return NextResponse.json({ message: "Follow-ups are disabled in settings." });
    }

    const today = new Date();
    
    // Find all leads where followUpDate <= today and status is Scheduled
    const dueLeads = await prisma.lead.findMany({
      where: {
        followUpStatus: "Scheduled",
        followUpDate: { lte: today },
        status: {
          notIn: ["Closed", "Rejected", "Unsubscribed", "Converted", "Won"]
        }
      }
    });

    let sentCount = 0;
    
    for (const lead of dueLeads) {
      if (!lead.email) continue;
      
      const subject = settings.followUpSubject || "Checking in regarding your website";
      let body = settings.followUpBody || "Hi,\n\nI just wanted to follow up on the website audit I sent over recently. Have you had a chance to look at it?\n\nLet me know if you have any questions or if you'd like to schedule a quick call to go over the recommendations.\n\nBest regards,";
      
      // Personalize basic tags if needed
      body = body.replace(/{{businessName}}/ig, lead.businessName || "your business");
      
      // We pass the email body to sendLeadEmail
      // sendLeadEmail will wrap it in professionalEmailHtml automatically
      const res = await sendLeadEmail(lead.id, null, body, subject, lead.email);
      
      if (res.success) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { followUpStatus: "Sent", followUpDate: null }
        });
        sentCount++;
      }
    }

    return NextResponse.json({ message: `Successfully processed ${dueLeads.length} leads. Sent ${sentCount} follow-ups.` });
  } catch (error: any) {
    console.error("Cron follow-up error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
