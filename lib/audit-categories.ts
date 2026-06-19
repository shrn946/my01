import { z } from "zod";

export const auditCategorySchema = z.enum([
  "redesign",
  "fix_issues",
  "loading_speed",
  "seo",
  "maintenance",
]);

export type AuditCategory = z.infer<typeof auditCategorySchema>;

export const AUDIT_CATEGORIES: Array<{
  value: AuditCategory;
  label: string;
  description: string;
}> = [
  { value: "redesign", label: "Re-Design", description: "Modern design, UX, mobile layout, branding, trust, and conversion." },
  { value: "fix_issues", label: "Fix Issues", description: "Technical problems, accessibility, broken functionality, and stability." },
  { value: "loading_speed", label: "Fix Loading Speed", description: "Performance, Core Web Vitals, images, scripts, caching, and responsiveness." },
  { value: "seo", label: "SEO Improvements", description: "On-page SEO, technical SEO, search visibility, content, and metadata." },
  { value: "maintenance", label: "Website Maintenance", description: "Updates, backups, security, uptime, optimization, monthly checks, and support." },
];
