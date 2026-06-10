"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateProposalPng, captureWebsiteScreenshot } from "@/lib/lead-actions";

// These actions simulate processing or integrate with external logic if present.
// For the workflow requirement, they update the lead state and simulate processing.

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function setReportGenerating(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { reportStatus: "Generating" }
  });
  revalidatePath("/dashboard");
}

export async function actionCaptureScreenshot(leadId: string) {
  const result = await captureWebsiteScreenshot(leadId);
  revalidatePath("/dashboard");
  return result;
}

export async function actionAnalyzeDesign(leadId: string) {
  await delay(1500);
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "Analyzing" }
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionVisualAudit(leadId: string) {
  await delay(1500);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionRecommendations(leadId: string) {
  await delay(1500);
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  
  if (!lead?.improvementProposals || lead.improvementProposals.length <= 3) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        improvementProposals: [
          "Modern Hero Section with high-converting CTA",
          "Optimized Typography for better readability",
          "High-Contrast & Strategic Call-to-Action Buttons",
          "Mobile-First Fluid & Responsive Layout",
          "Speed Optimization (Next.js & WebP)",
          "Better Lead Generation Forms & Flow",
          "SEO Friendly Semantic HTML Structure",
          "Trust Signals, Reviews & Testimonials Section"
        ]
      }
    });
  }
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionBeforeAfter(leadId: string) {
  await delay(2000);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionProposalPng(leadId: string) {
  const result = await generateProposalPng(leadId, "design");
  revalidatePath("/dashboard");
  return result;
}

export async function actionProposalPngTech(leadId: string) {
  const result = await generateProposalPng(leadId, "tech");
  revalidatePath("/dashboard");
  return result;
}

export async function actionPublicReport(leadId: string) {
  await delay(1000);
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { reportStatus: "Generated" }
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionPrepareEmail(leadId: string) {
  await delay(1000);
  return { success: true };
}
