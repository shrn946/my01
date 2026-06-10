"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateProposalPng, captureWebsiteScreenshot } from "@/lib/lead-actions";

// These actions mock the heavy lifting or integrate with actual playwright/puppeteer logic if present.
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
  return await captureWebsiteScreenshot(leadId);
}

export async function actionAnalyzeDesign(leadId: string) {
  await delay(1000); // Simulate design analysis
  return { success: true };
}

export async function actionVisualAudit(leadId: string) {
  await delay(1000); // Simulate annotating screenshot
  return { success: true };
}

export async function actionRecommendations(leadId: string) {
  await delay(1000);
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  
  if (!lead?.improvementProposals || lead.improvementProposals.length === 0) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        improvementProposals: [
          "Modern Hero Section",
          "Better Typography",
          "Strong CTA Buttons",
          "Mobile First Design",
          "Faster Loading Experience",
          "Better Lead Generation",
          "SEO Friendly Structure",
          "Trust Signals & Reviews"
        ]
      }
    });
  }
  return { success: true };
}

export async function actionBeforeAfter(leadId: string) {
  await delay(1500); // Simulate image generation
  return { success: true };
}

export async function actionProposalPng(leadId: string) {
  return await generateProposalPng(leadId, "design");
}

export async function actionProposalPngTech(leadId: string) {
  return await generateProposalPng(leadId, "tech");
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
