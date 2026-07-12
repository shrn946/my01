"use server";

import { getPrisma } from "@/lib/prisma";
import { updateAgency, sendAgencyEmail, createAgencyFollowup, updateAgencyFollowup, deleteAgencyFollowup, saveAgencyEmailDraft } from "@/lib/agency-actions";
import { revalidatePath } from "next/cache";

export async function updateProposalContent(id: string, headline: string, intro: string) {
  return updateAgency(id, {
    proposalHeadline: headline,
    proposalIntro: intro
  });
}

export async function toggleEmailProposalOption(emailId: string, currentValue: boolean) {
  try {
    const prisma = getPrisma();
    const emailObj = await prisma.agencyEmail.update({
      where: { id: emailId },
      data: { includeProposal: !currentValue }
    });
    revalidatePath(`/agency/agencies/${emailObj.agencyId}`);
    return { success: true, email: emailObj };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCustomEmail(agencyId: string, subject: string, bodyHtml: string, templateId?: string, includeProposal: boolean = true) {
  try {
    const res = await saveAgencyEmailDraft({
      agencyId,
      subject,
      bodyHtml,
      templateId,
      includeProposal
    });
    revalidatePath(`/agency/agencies/${agencyId}`);
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function triggerSendEmail(emailId: string, customBody?: string, customSubject?: string) {
  const prisma = getPrisma();
  const res = await sendAgencyEmail(emailId, customBody, customSubject);
  
  if (res.success) {
    const emailObj = await prisma.agencyEmail.findUnique({
      where: { id: emailId }
    });
    if (emailObj) {
      revalidatePath(`/agency/agencies/${emailObj.agencyId}`);
    }
  }
  return res;
}

export async function triggerDeleteEmail(emailId: string) {
  try {
    const prisma = getPrisma();
    const emailObj = await prisma.agencyEmail.delete({
      where: { id: emailId }
    });
    revalidatePath(`/agency/agencies/${emailObj.agencyId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAgencyDetailFollowup(agencyId: string, dateStr: string, notes: string) {
  const res = await createAgencyFollowup({
    agencyId,
    dueDate: new Date(dateStr),
    notes
  });
  if (res.success) {
    revalidatePath(`/agency/agencies/${agencyId}`);
  }
  return res;
}

export async function toggleFollowupStatus(agencyId: string, followupId: string, currentStatus: string) {
  const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
  const res = await updateAgencyFollowup(followupId, { status: newStatus });
  if (res.success) {
    revalidatePath(`/agency/agencies/${agencyId}`);
  }
  return res;
}

export async function deleteAgencyDetailFollowup(agencyId: string, followupId: string) {
  const res = await deleteAgencyFollowup(followupId);
  if (res.success) {
    revalidatePath(`/agency/agencies/${agencyId}`);
  }
  return res;
}

export async function getCompiledEmailPreviewAction(emailId: string, customSubject?: string, customBody?: string) {
  try {
    const prisma = getPrisma();
    const { getAgencySettings } = await import("@/lib/agency-actions");
    const { compileEmailHtml } = await import("@/lib/email-wrap");

    const emailObj = await prisma.agencyEmail.findUnique({
      where: { id: emailId },
      include: { agency: true }
    });
    if (!emailObj) throw new Error("Email log not found");

    const settings = await getAgencySettings();
    const finalSubject = customSubject || emailObj.subject;
    const rawBody = customBody || emailObj.bodyHtml;

    const compiledHtml = compileEmailHtml(rawBody, settings, emailObj.agency, emailObj.includeProposal);

    return {
      success: true,
      subject: finalSubject,
      html: compiledHtml,
      text: compiledHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCompiledTemplatePreviewAction(templateSubject: string, templateBody: string) {
  try {
    const { getAgencySettings } = await import("@/lib/agency-actions");
    const { compileEmailHtml } = await import("@/lib/email-wrap");

    const settings = await getAgencySettings();
    const mockAgency = {
      name: "Mock Agency LLC",
      contactName: "Alex Rivera",
      website: "https://mockagency.com",
      country: "United States",
      city: "San Francisco",
      slug: "mock-agency"
    };

    const compiledHtml = compileEmailHtml(templateBody, settings, mockAgency);

    return {
      success: true,
      subject: templateSubject.replace(/{{agency_name}}/g, mockAgency.name),
      html: compiledHtml,
      text: compiledHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
