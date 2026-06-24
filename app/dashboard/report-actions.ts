"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAuditExports, generateProposalPng, captureWebsiteScreenshot } from "@/lib/lead-actions";
import { formatDeveloperComments, generateAiAudit } from "@/lib/ai-audit";
import { auditCategorySchema, type AuditCategory } from "@/lib/audit-categories";
import { getLeadAiFields, saveLeadAiAnalysis, saveLeadReportContent, saveLeadReportMedia } from "@/lib/lead-ai-storage";
import { getReportContent, getReportMedia, reportMediaItemSchema } from "@/lib/report-content";
import { storeGeneratedFile } from "@/lib/generated-image-storage";

// These actions simulate processing or integrate with external logic if present.
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function actionPrepareEmail(leadId: string) {
  await delay(1000);
  return { success: true };
}

export async function setReportGenerating(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { reportStatus: "Generating" }
  });
  revalidatePath("/dashboard");
}

export async function actionCaptureScreenshot(leadId: string, fullPage: boolean = false) {
  const result = await captureWebsiteScreenshot(leadId, fullPage);
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

export async function actionRecommendations(leadId: string, categories: AuditCategory[]) {
  const selectedCategories = Array.from(new Set(categories)).map((category) => auditCategorySchema.parse(category));
  if (selectedCategories.length === 0) throw new Error("Select at least one audit category");
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  const aiFields = await getLeadAiFields(prisma, leadId);
  const referenceImages = getReportMedia(aiFields.reportMedia);
  
  if (lead.desktopImage) {
    referenceImages.push({ id: 'desktop-full', url: lead.desktopImage, fileName: 'desktop.png', type: 'general', caption: 'Full-page Desktop View', section: 'findings', includeInEmail: false, createdAt: new Date().toISOString() });
  }
  if (lead.mobileImage) {
    referenceImages.push({ id: 'mobile-full', url: lead.mobileImage, fileName: 'mobile.png', type: 'general', caption: 'Full-page Mobile View', section: 'findings', includeInEmail: false, createdAt: new Date().toISOString() });
  }

  const aiResult = await generateAiAudit({
    website: lead.website,
    businessName: lead.businessName,
    selectedCategories,
    scores: {
      overall: lead.websiteScore || 0,
      performance: lead.performanceScore || 0,
      seo: lead.seoScore || 0,
      accessibility: lead.accessibilityScore || 0,
      bestPractices: lead.bestPracticesScore || 0,
      mobile: lead.mobileScore || 0,
      desktop: lead.desktopScore || 0,
      design: lead.designScore,
      conversion: lead.conversionScore,
    },
    issues: lead.topIssues?.split("\n").filter(Boolean) || [],
    designAnalysis: lead.designAnalysis,
    referenceImages,
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      developerComments: formatDeveloperComments(aiResult.audit),
      improvementProposals: aiResult.audit.recommendations.map((item) => item.recommendation),
      reportStatus: "Generating",
    },
  });
  await saveLeadAiAnalysis(prisma, leadId, aiResult.audit);
  revalidatePath("/dashboard");
  return { success: true, source: aiResult.source, warning: aiResult.warning };
}

export async function actionBeforeAfter(leadId: string) {
  await delay(2000);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function actionProposalPng(leadId: string) {
  const result = await generateProposalPng(leadId, "focused");
  revalidatePath("/dashboard");
  return result;
}

export async function actionPublicReport(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { reportStatus: "Generated" }
  });
  revalidatePath("/dashboard");
  return { success: true, reportPdf: null, reportImage: null, proposalPdf: null, error: undefined };
}

export async function saveReportEdits(
  leadId: string,
  developerComments: string,
  recommendations: string[],
) {
  const prisma = getPrisma();
  const aiFields = await getLeadAiFields(prisma, leadId);
  const current = getReportContent(aiFields.reportContent);
  const next = {
    developerComments,
    recommendations: recommendations.filter(Boolean),
    history: [
      ...current.history,
      {
        id: Math.random().toString(36).substring(2, 15),
        savedAt: new Date().toISOString(),
        developerComments: current.developerComments,
        recommendations: current.recommendations,
      },
    ].slice(-20),
  };
  await saveLeadReportContent(prisma, leadId, next);
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      developerComments,
      improvementProposals: next.recommendations,
      reportStatus: "Not Generated",
    },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/report/${leadId}`);
  return { success: true, reportContent: next };
}

export async function uploadLeadReportMedia(formData: FormData) {
  const leadId = String(formData.get("leadId") || "");
  const file = formData.get("file");
  if (!leadId || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose an image file." };
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, and WebP images are supported." };
  }
  if (file.size > 8_000_000) {
    return { success: false, error: "Image size must be under 8 MB." };
  }

  const type = String(formData.get("type") || "general");
  const section = String(formData.get("section") || "appendix");
  const caption = String(formData.get("caption") || "").trim() || file.name;
  const notes = String(formData.get("notes") || "").trim();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const objectName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
  const url = await storeGeneratedFile(
    Buffer.from(await file.arrayBuffer()),
    `report-media/${leadId}/${objectName}`,
    file.type,
  );

  const prisma = getPrisma();
  // If this is meant to be the main screenshot
  if (type === "main_screenshot") {
    await prisma.lead.update({
      where: { id: leadId },
      data: { desktopImage: url, reportStatus: "Not Generated" },
    });
    revalidatePath("/dashboard");
    return { success: true, item: { url, caption, section, type, id: "main", includeInEmail: false, fileName: file.name, createdAt: new Date().toISOString() } };
  } else if (type === "before_image") {
    await prisma.lead.update({
      where: { id: leadId },
      data: { beforeAfterImage: url, reportStatus: "Not Generated" },
    });
    revalidatePath("/dashboard");
    return { success: true, item: { url, caption, section, type, id: "before", includeInEmail: false, fileName: file.name, createdAt: new Date().toISOString() } };
  } else if (type === "after_image") {
    const lead = await prisma.lead.findUnique({where: {id: leadId}});
    const reportContent = getReportContent(lead?.reportContent as any);
    await prisma.lead.update({
      where: { id: leadId },
      data: { proposalImage: url, reportContent: { ...reportContent, afterImage: url } as any, reportStatus: "Not Generated" },
    });
    revalidatePath("/dashboard");
    return { success: true, item: { url, caption, section, type, id: "after", includeInEmail: false, fileName: file.name, createdAt: new Date().toISOString() } };
  }

  const item = reportMediaItemSchema.parse({
    id: Math.random().toString(36).substring(2, 15),
    url,
    fileName: file.name,
    type,
    section,
    caption,
    notes,
    includeInEmail: formData.get("includeInEmail") === "true",
    createdAt: new Date().toISOString(),
  });

  const aiFields = await getLeadAiFields(prisma, leadId);
  const media = [...getReportMedia(aiFields.reportMedia), item];
  await saveLeadReportMedia(prisma, leadId, media);
  await prisma.lead.update({ where: { id: leadId }, data: { reportStatus: "Not Generated" } });
  revalidatePath("/dashboard");
  return { success: true, item };
}

export async function removeLeadReportMedia(leadId: string, mediaId: string) {
  const prisma = getPrisma();
  const aiFields = await getLeadAiFields(prisma, leadId);
  const media = getReportMedia(aiFields.reportMedia).filter((item) => item.id !== mediaId);
  await saveLeadReportMedia(prisma, leadId, media);
  await prisma.lead.update({ where: { id: leadId }, data: { reportStatus: "Not Generated" } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLeadReportMediaNotes(leadId: string, mediaId: string, notes: string) {
  const prisma = getPrisma();
  const aiFields = await getLeadAiFields(prisma, leadId);
  const media = getReportMedia(aiFields.reportMedia).map((item) => {
    if (item.id === mediaId) {
      return { ...item, notes };
    }
    return item;
  });
  await saveLeadReportMedia(prisma, leadId, media);
  await prisma.lead.update({ where: { id: leadId }, data: { reportStatus: "Not Generated" } });
  revalidatePath("/dashboard");
  return { success: true, media };
}

export async function lockAfterImage(leadId: string) {
  const prisma = getPrisma();
  const aiFields = await getLeadAiFields(prisma, leadId);
  const current = getReportContent(aiFields.reportContent);
  const next = {
    ...current,
    isAfterImageLocked: true,
  };
  await saveLeadReportContent(prisma, leadId, next);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function generateSocialOutreachProposal(leadId: string) {
  const prisma = getPrisma();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { success: false, error: "Lead not found" };

  const message = `Hi ${lead.businessName || "team"},

I came across your website and noticed some great opportunities to improve your online presence. As a specialist in web development, I've put together a quick analysis of your site.

I'd love to help you optimize your conversion rates and speed. Are you open to a brief chat about how we can take your digital presence to the next level?

Best regards,
[Your Name]`;

  return { success: true, message };
}
