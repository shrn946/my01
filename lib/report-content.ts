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
  customProposal: z.string().optional(),
  history: z.array(z.object({
    id: z.string(),
    savedAt: z.string(),
    developerComments: z.string(),
    recommendations: z.array(z.string()),
    customProposal: z.string().optional(),
  })).default([]),
  includeBeforeAfter: z.boolean().default(false),
  hideAfterImage: z.boolean().default(false),
  afterImage: z.string().optional(),
  isAfterImageLocked: z.boolean().optional(),
  customEmailSubject: z.string().optional(),
  customEmailBody: z.string().optional(),
  recipientEmail: z.string().optional(),
  portfolioLinks: z.array(z.object({
    title: z.string(),
    category: z.string(),
    description: z.string().optional(),
    url: z.string(),
    image: z.string().optional(),
    selected: z.boolean().default(true),
  })).default([]),
});

export type ReportMediaItem = z.infer<typeof reportMediaItemSchema>;
export type ReportContent = z.infer<typeof reportContentSchema>;

export function getReportContent(value: unknown): ReportContent {
  const parsed = reportContentSchema.safeParse(value);
  return parsed.success ? parsed.data : { 
    developerComments: "", 
    recommendations: [], 
    history: [], 
    includeBeforeAfter: false, 
    hideAfterImage: false,
    portfolioLinks: [] 
  };
}

export function getReportMedia(value: unknown): ReportMediaItem[] {
  const parsed = z.array(reportMediaItemSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}
