import { z } from "zod";

export const auditCategorySchema = z.enum([
  "redesign",
  "fix_issues",
  "loading_speed",
  "seo",
  "maintenance",
  "ecommerce",
  "lead_gen",
  "accessibility",
  "custom_dev",
  "small_fixes",
  "design_improvements"
]);

export type AuditCategory = z.infer<typeof auditCategorySchema>;

export const AUDIT_CATEGORIES: Array<{
  value: AuditCategory;
  label: string;
  description: string;
}> = [
  { value: "redesign", label: "Complete Re-Design (Offer Free Demo)", description: "Transform outdated aesthetics into a modern, high-converting experience with premium UI/UX, responsive layouts, and strong brand alignment." },
  { value: "fix_issues", label: "Maintenance, Security & Repairs", description: "Ensure peace of mind with regular updates, hardened security, and by resolving layout breaks, broken links, or friction points." },
  { value: "loading_speed", label: "Performance & Technical SEO", description: "Drastically reduce load times, optimize Core Web Vitals, and dominate search rankings through technical metadata and semantic content structuring." },
  { value: "lead_gen", label: "Conversion & Sales Optimization", description: "Increase revenue and generate leads by optimizing landing pages, checkout flows, compelling CTAs, and CRM integrations." },
  { value: "accessibility", label: "ADA & Accessibility Compliance", description: "Protect against lawsuits and expand your audience by ensuring screen-reader compatibility, contrast ratios, and keyboard navigation." },
  { value: "custom_dev", label: "Custom Feature Development", description: "Build complex interactive tools, custom API integrations, dynamic dashboards, and specialized backend functionality." },
  { value: "small_fixes", label: "Website Changes & Content Updates", description: "Text updates, image replacements, broken links, minor functionality fixes, layout improvements, and general website maintenance." },
  { value: "design_improvements", label: "Website Design Improvements", description: "Enhance the existing website without a full redesign, including layout refinements, visual styling updates, improved spacing and typography, modern UI enhancements, mobile responsiveness, navigation improvements, and overall user experience upgrades while preserving the current content and structure." },
];
