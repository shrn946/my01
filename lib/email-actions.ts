"use server";

import { getPrisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_for_build");

export async function sendLeadEmail(leadId: string, templateId: string | null, customBody: string, subject: string, toEmail: string) {
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const baseUrl = settings?.portfolioUrl || "";

    // Basic limit check: Max 20 emails per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = await prisma.emailLog.count({
      where: {
        sentAt: { gte: today }
      }
    });

    if (sentToday >= 20) {
      throw new Error("Daily email limit of 20 reached. Try again tomorrow.");
    }

    let status = "Sent";
    let errorMsg = null;
    
    // Convert newlines to <br> and handle potential HTML tags
    const htmlBody = customBody.replace(/\n/g, "<br>");

    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: `${settings?.senderName || "Agency"} <${settings?.senderEmail || "onboarding@resend.dev"}>`,
          to: [toEmail],
          subject: subject,
          html: htmlBody,
          text: customBody.replace(/<[^>]*>?/gm, ''), // Plain text fallback
        });
      } else {
        console.log("No RESEND_API_KEY provided. Mocking email send to:", toEmail);
      }
    } catch (e: any) {
      status = "Failed";
      errorMsg = e.message;
    }

    const log = await prisma.emailLog.create({
      data: {
        leadId,
        templateId,
        toEmail,
        subject,
        body: customBody,
        status,
        errorMessage: errorMsg
      }
    });

    if (status === "Sent") {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 5);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "Contacted",
          lastContactedAt: new Date(),
          followUpDate
        }
      });
    }

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");

    if (status === "Failed") throw new Error("Email sending failed: " + errorMsg);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendTestEmail() {
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const latestLead = await prisma.lead.findFirst({
      orderBy: { createdAt: "desc" }
    });
    
    const testEmail = "shrn496@gmail.com";
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured in .env file.");
    }

    const businessName = latestLead?.businessName || "Test Business";
    const website = latestLead?.website || "www.example.com";
    const overallScore = latestLead?.websiteScore || 85;
    const perfScore = latestLead?.performanceScore || 80;
    const seoScore = latestLead?.seoScore || 90;
    const accScore = latestLead?.accessibilityScore || 75;
    const bpScore = latestLead?.bestPracticesScore || 95;

    const { data, error } = await resend.emails.send({
      from: `${settings?.senderName || "Agency"} <${settings?.senderEmail || "onboarding@resend.dev"}>`,
      to: [testEmail],
      subject: `Test Proposal: ${businessName}`,
      html: `
        <div style="font-family: sans-serif; padding: 40px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 24px;">Email Configuration Test</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
              Your **Resend API** integration is working! This test uses data from your **latest lead** to show you how a real proposal looks.
            </p>
            
            <div style="margin: 32px 0; padding: 24px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #dbeafe;">
              <h2 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px; font-weight: 700;">Latest Lead Preview</h2>
              <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Business:</strong> ${businessName}</p>
              <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;"><strong>Website:</strong> ${website}</p>
              
              <div style="margin-top: 20px; border-top: 1px solid #dbeafe; pt: 16px;">
                 <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px;"><strong>Overall Score:</strong> ${overallScore}%</p>
                 <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;"><strong>Performance:</strong> ${perfScore}%</p>
                 <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;"><strong>SEO:</strong> ${seoScore}%</p>
                 <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;"><strong>Accessibility:</strong> ${accScore}%</p>
                 <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;"><strong>Best Practices:</strong> ${bpScore}%</p>
              </div>
            </div>

            <div style="margin-top: 32px; padding: 20px; background-color: #f3f4f6; border-radius: 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Sender Details</p>
              <p style="margin: 8px 0 0 0; color: #111827; font-size: 14px;"><strong>From:</strong> ${settings?.senderEmail || "onboarding@resend.dev"}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error: any) {
    console.error("Test Email Error:", error);
    return { success: false, error: error.message };
  }
}

