"use server";

import { getPrisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getLeadAiFields } from "./lead-ai-storage";
import { getAiAudit } from "./ai-audit";
import { getReportContent, getReportMedia } from "./report-content";
import path from "path";
import fs from "fs";

function absoluteUrl(baseUrl: string, value: string | null | undefined) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  return `${baseUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function professionalEmailHtml({
  body,
  businessName,
  companyName,
  reportUrl,
  findings,
  media,
  contactUrl,
  analyzeWithoutReport = false,
}: {
  body: string;
  businessName: string;
  companyName: string;
  reportUrl: string;
  findings: string[];
  media: Array<{ url: string; caption: string }>;
  contactUrl: string;
  analyzeWithoutReport?: boolean;
}) {
  const findingsHtml = findings.slice(0, 5).map((item) =>
    `<tr><td style="padding:10px 0;color:#3f3f46;font-size:15px;line-height:24px;border-bottom:1px solid #f4f4f5;"><span style="color:#2563eb;font-weight:800;display:inline-block;margin-right:8px;">✓</span> ${escapeHtml(item)}</td></tr>`,
  ).join("");

  const mediaHtml = media.map((item) => `
    <tr><td style="padding:20px 0 0; text-align:center;">
      <img src="${item.url}" width="500" alt="${escapeHtml(item.caption)}" style="display:block;width:100%;max-width:500px;height:auto;border-radius:12px;border:1px solid #e4e4e7;margin:0 auto;">
      <p style="margin:8px 0 0;color:#71717a;font-size:13px;line-height:20px;text-align:center;">${escapeHtml(item.caption)}</p>
    </td></tr>`).join("");

  let headerTitle = "Website Audit & Recommendations";
  let showFindings = true;
  let showReportButton = true;
  let buttonText = "View Full Audit Report";

  if (analyzeWithoutReport) {
    if (media && media.length > 0) {
      headerTitle = "Website Issues Report";
      showFindings = true;
      showReportButton = true;
      buttonText = "View Website Issues Report";
    } else {
      headerTitle = "Website Feedback & Recommendations";
      showFindings = false;
      showReportButton = false;
    }
  }

  const findingsTitle = analyzeWithoutReport ? "Observed Website Issues" : "Key Observations";

  return `<!doctype html>
  <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>@media only screen and (max-width:640px){.email-shell{width:100%!important;border-radius:0!important;border:none!important}.email-pad{padding:24px 20px!important}.email-button{display:block!important;margin:10px 0!important;text-align:center!important}}</style>
  </head><body style="margin:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;padding:40px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;">
      <tr><td align="center" style="padding: 0 10px;">
        <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr><td class="email-pad" style="padding:40px;background-color:#ffffff;text-align:center;border-bottom:1px solid #f1f5f9;">
            <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:0 auto;">
              <tr>
                <td style="width:40px;height:40px;background-color:#2563eb;border-radius:12px;text-align:center;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:900;line-height:40px;">C</td>
                <td style="padding-left:12px;font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;vertical-align:middle;">CoreWeb<span style="color:#2563eb;">Labs</span></td>
              </tr>
            </table>
            <h1 style="margin:16px 0 0;font-size:26px;line-height:34px;color:#0f172a;font-weight:800;">${headerTitle}</h1>
            <p style="margin:12px 0 0;color:#64748b;font-size:16px;">Prepared for <strong>${escapeHtml(businessName)}</strong></p>
          </td></tr>

          <!-- Body Text -->
          <tr><td class="email-pad" style="padding:40px 40px 20px;background-color:#ffffff;">
            <div style="color:#334155;font-size:16px;line-height:26px;">
              ${body.replace(/\n/g, "<br>")}
              ${analyzeWithoutReport && media && media.length > 0 ? `
                <p style="margin-top:20px;color:#334155;font-size:16px;line-height:26px;font-weight:600;">
                  I've identified a few issues with your website. Please review the <a href="${reportUrl}" style="color:#2563eb;text-decoration:underline;">Issues Report</a> for screenshots and more details.
                </p>
              ` : ""}
            </div>
          </td></tr>

          <!-- Findings -->
          ${showFindings ? `
          <tr><td class="email-pad" style="padding:30px 40px;background-color:#fafaf9;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
            <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;font-weight:700;">${findingsTitle}</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${findingsHtml}</table>
          </td></tr>
          ` : ""}

          <!-- Extra Media -->
          ${mediaHtml ? `<tr><td class="email-pad" style="padding:20px 40px;"><table role="presentation" width="100%">${mediaHtml}</table></td></tr>` : ""}

          <!-- Action Buttons -->
          ${showReportButton ? `
          <tr><td class="email-pad" style="padding:40px;background-color:#ffffff;text-align:center;">
            <a class="email-button" href="${reportUrl}" target="_blank" style="display:inline-block;padding:14px 28px;border-radius:8px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;box-shadow:0 2px 4px rgba(37,99,235,0.2);">${buttonText}</a>
          </td></tr>
          ` : ""}

          <!-- Footer -->
          <tr><td class="email-pad" style="padding:40px;background-color:#0f172a;text-align:center;">
            <h2 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">Ready to discuss the recommended improvements?</h2>
            <a class="email-button" href="https://www.coreweblabs.com/contact" target="_blank" style="display:inline-block;margin-top:24px;padding:16px 32px;border-radius:10px;background-color:#3b82f6;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;box-shadow:0 4px 14px 0 rgba(59,130,246,0.39);">Book a Consultation</a>
          </td></tr>

        </table>
        <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center;">&copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.</p>
      </td></tr>
    </table>
  </body></html>`;
}

export async function sendLeadEmail(leadId: string, templateId: string | null, customBody: string, subject: string, toEmail: string) {
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const resend = new Resend(settings?.resendApiKey || process.env.RESEND_API_KEY || "dummy_key_for_build");
    const baseUrl = settings?.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found.");
    const aiFields = await getLeadAiFields(prisma, leadId);
    const audit = getAiAudit(aiFields.aiAnalysis);
    const reportContent = getReportContent(aiFields.reportContent);
    const analyzeWithoutReport = !!(aiFields.reportContent as any)?.analyzeWithoutReport;
    const reportMedia = getReportMedia(aiFields.reportMedia)
      .filter((item) => item.includeInEmail || item.section === "email")
      .map((item) => ({ url: absoluteUrl(baseUrl, item.url), caption: item.caption }));

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
    
    const reportUrl = absoluteUrl(baseUrl, analyzeWithoutReport ? `/report/${leadId}?format=issues` : `/report/${leadId}`);

    const htmlBody = professionalEmailHtml({
      body: customBody,
      businessName: lead.businessName || "Your Business",
      companyName: settings?.companyName || settings?.senderName || "Website Consultant",
      reportUrl,
      findings: reportContent.recommendations.length
        ? reportContent.recommendations
        : audit?.png_report_data.findings || lead.topIssues?.split("\n").filter(Boolean) || [],
      media: reportMedia,
      contactUrl: settings?.portfolioUrl || `mailto:${settings?.senderEmail || "hello@example.com"}`,
      analyzeWithoutReport,
    });

    try {
      if (settings?.resendApiKey || process.env.RESEND_API_KEY) {
        const { error } = await resend.emails.send({
          from: `${settings?.senderName || "Agency"} <${settings?.senderEmail || "onboarding@resend.dev"}>`,
          to: toEmail.split(",").map((e) => e.trim()).filter(Boolean),
          subject: subject,
          html: htmlBody,
          text: customBody.replace(/<[^>]*>?/gm, '') + (analyzeWithoutReport ? (reportMedia.length > 0 ? `\n\nI've identified a few issues with your website. Please review the Issues Report for screenshots and more details: ${reportUrl}` : "") : `\n\nView Full Audit Report: ${reportUrl}`), // Plain text fallback
          tags: [
            { name: "lead_id", value: leadId }
          ]
        });
        
        if (error) {
          throw new Error(error.message);
        }
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
      followUpDate.setDate(followUpDate.getDate() + 10); // 1.5 weeks (10 days)

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "Contacted",
          lastContactedAt: new Date(),
          followUpDate,
          followUpStatus: "Scheduled"
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
    const resend = new Resend(settings?.resendApiKey || process.env.RESEND_API_KEY || "dummy_key_for_build");
    const latestLead = await prisma.lead.findFirst({
      orderBy: { createdAt: "desc" }
    });
    
    const testEmail = "shrn496@gmail.com";
    
    if (!settings?.resendApiKey && !process.env.RESEND_API_KEY) {
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
