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
  "custom_dev"
]);

export type AuditCategory = z.infer<typeof auditCategorySchema>;

export const AUDIT_CATEGORIES: Array<{
  value: AuditCategory;
  label: string;
  description: string;
}> = [
  { value: "redesign", label: "Complete Re-Design (Offer Free Demo)", description: "Transform outdated aesthetics into a modern, high-converting experience with premium UI/UX, responsive layouts, and strong brand alignment." },
  { value: "fix_issues", label: "Bug Fixes & UX Repair", description: "Resolve layout breaks, technical glitches, broken links, and friction points that cause visitors to bounce." },
  { value: "loading_speed", label: "Performance & Speed Optimization", description: "Drastically reduce load times, optimize Core Web Vitals, compress assets, and implement advanced caching for lightning-fast speeds." },
  { value: "seo", label: "SEO & Search Visibility", description: "Dominate search rankings through on-page SEO, schema markup, technical metadata, and semantic content structuring." },
  { value: "ecommerce", label: "E-Commerce Optimization", description: "Increase average order value and reduce cart abandonment by optimizing product pages, checkout flows, and payment integrations." },
  { value: "lead_gen", label: "Lead Generation & Conversion", description: "Build high-converting landing pages, compelling CTAs, magnetic forms, and seamlessly integrate them into your CRM." },
  { value: "accessibility", label: "ADA & Accessibility Compliance", description: "Protect against lawsuits and expand your audience by ensuring screen-reader compatibility, contrast ratios, and keyboard navigation." },
  { value: "custom_dev", label: "Custom Feature Development", description: "Build complex interactive tools, custom API integrations, dynamic dashboards, and specialized backend functionality." },
  { value: "maintenance", label: "Ongoing Maintenance & Security", description: "Ensure complete peace of mind with regular updates, hardened security, automated backups, and guaranteed uptime monitoring." },
];
