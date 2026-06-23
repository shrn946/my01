import "server-only";

import type { PrismaClient } from "@prisma/client";

export type LeadAiFields = {
  aiAnalysis: unknown | null;
  reportContent: unknown | null;
  reportMedia: unknown | null;
  reportPdf: string | null;
  reportImage: string | null;
  proposalPdf: string | null;
};

export async function getLeadAiFields(
  prisma: PrismaClient,
  leadId: string,
): Promise<LeadAiFields> {
  const rows = await prisma.$queryRaw<LeadAiFields[]>`
    SELECT "aiAnalysis", "reportContent", "reportMedia", "reportPdf", "reportImage", "proposalPdf"
    FROM "Lead"
    WHERE "id" = ${leadId}
    LIMIT 1
  `;
  return rows[0] || {
    aiAnalysis: null,
    reportContent: null,
    reportMedia: null,
    reportPdf: null,
    reportImage: null,
    proposalPdf: null,
  };
}

export async function saveLeadAiAnalysis(
  prisma: PrismaClient,
  leadId: string,
  aiAnalysis: unknown,
) {
  const json = JSON.stringify(aiAnalysis);
  await prisma.$executeRaw`
    UPDATE "Lead"
    SET "aiAnalysis" = ${json}::jsonb
    WHERE "id" = ${leadId}
  `;
}

export async function saveLeadReportPaths(
  prisma: PrismaClient,
  leadId: string,
  reportPdf: string | null,
  reportImage: string | null,
  proposalPdf: string | null,
) {
  await prisma.$executeRaw`
    UPDATE "Lead"
    SET "reportPdf" = ${reportPdf}, "reportImage" = ${reportImage}, "proposalPdf" = ${proposalPdf}
    WHERE "id" = ${leadId}
  `;
}

export async function saveLeadReportContent(
  prisma: PrismaClient,
  leadId: string,
  reportContent: unknown,
) {
  const json = JSON.stringify(reportContent);
  await prisma.$executeRaw`
    UPDATE "Lead"
    SET "reportContent" = ${json}::jsonb
    WHERE "id" = ${leadId}
  `;
}

export async function saveLeadReportMedia(
  prisma: PrismaClient,
  leadId: string,
  reportMedia: unknown,
) {
  const json = JSON.stringify(reportMedia);
  await prisma.$executeRaw`
    UPDATE "Lead"
    SET "reportMedia" = ${json}::jsonb
    WHERE "id" = ${leadId}
  `;
}
