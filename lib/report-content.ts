import { z } from "zod";

export const reportMediaItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  fileName: z.string(),
  type: z.enum(["website_issue", "competitor", "branding", "before_after", "general"]),
  section: z.enum(["findings", "recommendations", "proposal", "email", "appendix"]),
  caption: z.string(),
  notes: z.string().optional(),
  includeInEmail: z.boolean(),
  createdAt: z.string(),
});

export const reportContentSchema = z.object({
  developerComments: z.string().default(""),
  recommendations: z.array(z.string()).default([]),
  history: z.array(z.object({
    id: z.string(),
    savedAt: z.string(),
    developerComments: z.string(),
    recommendations: z.array(z.string()),
  })).default([]),
  includeBeforeAfter: z.boolean().default(false),
});

export type ReportMediaItem = z.infer<typeof reportMediaItemSchema>;
export type ReportContent = z.infer<typeof reportContentSchema>;

export function getReportContent(value: unknown): ReportContent {
  const parsed = reportContentSchema.safeParse(value);
  return parsed.success ? parsed.data : { developerComments: "", recommendations: [], history: [], includeBeforeAfter: false };
}

export function getReportMedia(value: unknown): ReportMediaItem[] {
  const parsed = z.array(reportMediaItemSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}
