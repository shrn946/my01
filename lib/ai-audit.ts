import "server-only";

import { getPrisma } from "./prisma";

import * as cheerio from "cheerio";
import { readFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { AUDIT_CATEGORIES, auditCategorySchema, type AuditCategory } from "./audit-categories";
import type { ReportMediaItem } from "./report-content";

export { AUDIT_CATEGORIES, auditCategorySchema, type AuditCategory } from "./audit-categories";

const prioritySchema = z.enum(["critical", "high", "medium", "low"]);

const developerCommentSchema = z.object({
  category: auditCategorySchema,
  priority: prioritySchema,
  heading: z.string(),
  finding: z.string(),
  recommendation: z.string(),
  evidence: z.string(),
  strength: z.boolean(),
});

const recommendationSchema = z.object({
  category: auditCategorySchema,
  priority: prioritySchema,
  title: z.string(),
  finding: z.string(),
  recommendation: z.string(),
  business_impact: z.string(),
});

const reportSectionSchema = z.object({
  category: auditCategorySchema,
  heading: z.string(),
  analysis: z.string(),
  findings: z.array(z.string()).min(1).max(20),
  recommendations: z.array(z.string()).min(1).max(20),
});

export const aiAuditSchema = z.object({
  selected_categories: z.array(auditCategorySchema).min(1).max(20),
  audit_summary: z.object({
    overview: z.string(),
    strengths: z.array(z.string()).max(20),
    priority_issues: z.array(z.string()).max(20),
  }),
  developer_comments: z.array(developerCommentSchema).min(1).max(40),
  recommendations: z.array(recommendationSchema).min(1).max(40),
  proposal_content: z.object({
    title: z.string(),
    subject: z.string(),
    executive_pitch: z.string(),
    scope: z.array(z.string()).min(1).max(30),
    expected_outcomes: z.array(z.string()).min(1).max(30),
    call_to_action: z.string(),
    email_subject: z.string(),
    email_body: z.string(),
    maintenance_pricing: z.object({
      included: z.boolean(),
      plan_name: z.string(),
      price_note: z.string(),
      services: z.array(z.string()).max(20),
    }),
  }),
  png_report_data: z.object({
    headline: z.string(),
    score_label: z.string(),
    findings: z.array(z.string()).min(1).max(20),
    recommendations: z.array(z.string()).min(1).max(20),
    developer_comments: z.array(z.string()).min(1).max(20),
  }),
  full_report_data: z.object({
    executive_summary: z.string(),
    sections: z.array(reportSectionSchema).min(1).max(20),
    action_plan: z.array(z.string()).min(1).max(30),
  }),
});

export type AiAudit = z.infer<typeof aiAuditSchema>;

type AuditInput = {
  website: string;
  businessName?: string | null;
  selectedCategories: AuditCategory[];
  scores: {
    overall: number;
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
    mobile: number;
    desktop: number;
    design?: number | null;
    conversion?: number | null;
  };
  issues: string[];
  designAnalysis?: unknown;
  homepageHtml?: string;
  referenceImages?: ReportMediaItem[];
};

type CrawledPage = {
  url: string;
  title: string;
  description: string;
  h1: string[];
  h2: string[];
  wordCount: number;
  forms: number;
  ctas: string[];
  images: number;
  imagesMissingAlt: number;
  trustSignals: string[];
  excerpt: string;
};

const responseSchema = {
  type: "object",
  properties: {
    selected_categories: { type: "array", items: { type: "string", enum: auditCategorySchema.options } },
    audit_summary: {
      type: "object",
      properties: {
        overview: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        priority_issues: { type: "array", items: { type: "string" } },
      },
      required: ["overview", "strengths", "priority_issues"],
    },
    developer_comments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: auditCategorySchema.options },
          priority: { type: "string", enum: prioritySchema.options },
          heading: { type: "string" },
          finding: { type: "string" },
          recommendation: { type: "string" },
          evidence: { type: "string" },
          strength: { type: "boolean" },
        },
        required: ["category", "priority", "heading", "finding", "recommendation", "evidence", "strength"],
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: auditCategorySchema.options },
          priority: { type: "string", enum: prioritySchema.options },
          title: { type: "string" },
          finding: { type: "string" },
          recommendation: { type: "string" },
          business_impact: { type: "string" },
        },
        required: ["category", "priority", "title", "finding", "recommendation", "business_impact"],
      },
    },
    proposal_content: {
      type: "object",
      properties: {
        title: { type: "string" },
        subject: { type: "string" },
        executive_pitch: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        expected_outcomes: { type: "array", items: { type: "string" } },
        call_to_action: { type: "string" },
        email_subject: { type: "string" },
        email_body: { type: "string" },
        maintenance_pricing: {
          type: "object",
          properties: {
            included: { type: "boolean" },
            plan_name: { type: "string" },
            price_note: { type: "string" },
            services: { type: "array", items: { type: "string" } },
          },
          required: ["included", "plan_name", "price_note", "services"],
        },
      },
      required: ["title", "subject", "executive_pitch", "scope", "expected_outcomes", "call_to_action", "email_subject", "email_body", "maintenance_pricing"],
    },
    png_report_data: {
      type: "object",
      properties: {
        headline: { type: "string" },
        score_label: { type: "string" },
        findings: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        developer_comments: { type: "array", items: { type: "string" } },
      },
      required: ["headline", "score_label", "findings", "recommendations", "developer_comments"],
    },
    full_report_data: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string", enum: auditCategorySchema.options },
              heading: { type: "string" },
              analysis: { type: "string" },
              findings: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
            },
            required: ["category", "heading", "analysis", "findings", "recommendations"],
          },
        },
        action_plan: { type: "array", items: { type: "string" } },
      },
      required: ["executive_summary", "sections", "action_plan"],
    },
  },
  required: [
    "selected_categories",
    "audit_summary",
    "developer_comments",
    "recommendations",
    "proposal_content",
    "png_report_data",
    "full_report_data",
  ],
};

function cleanText(value: string, max = 400) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebsiteAuditConsultant/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) return "";
    return (await response.text()).slice(0, 1_500_000);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function analyzePage(url: string, html: string): CrawledPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  const bodyText = cleanText($("body").text(), 6_000);
  const trustTerms = ["testimonial", "review", "trusted", "certified", "award", "guarantee", "case study", "secure", "licensed"];
  const lowerText = bodyText.toLowerCase();
  return {
    url,
    title: cleanText($("title").text(), 140),
    description: cleanText($("meta[name='description']").attr("content") || "", 220),
    h1: $("h1").map((_, el) => cleanText($(el).text(), 160)).get().filter(Boolean).slice(0, 4),
    h2: $("h2").map((_, el) => cleanText($(el).text(), 140)).get().filter(Boolean).slice(0, 10),
    wordCount: bodyText.split(/\s+/).filter(Boolean).length,
    forms: $("form").length,
    ctas: $("button, a.btn, a.button, [class*='cta'], [class*='button'], [class*='btn']")
      .map((_, el) => cleanText($(el).text(), 80)).get().filter(Boolean).slice(0, 12),
    images: $("img").length,
    imagesMissingAlt: $("img").filter((_, el) => !($(el).attr("alt") || "").trim()).length,
    trustSignals: trustTerms.filter((term) => lowerText.includes(term)),
    excerpt: bodyText.slice(0, 1_500),
  };
}

async function crawlWebsite(url: string, homepageHtml = "") {
  const origin = new URL(url).origin;
  const firstHtml = homepageHtml || await fetchHtml(url);
  const pages = firstHtml ? [analyzePage(url, firstHtml)] : [];
  if (!firstHtml) return pages;
  const $ = cheerio.load(firstHtml);
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const next = new URL(href, origin);
      if (next.origin === origin && !/\.(pdf|jpg|jpeg|png|gif|webp|zip)$/i.test(next.pathname)) {
        next.hash = "";
        links.add(next.toString());
      }
    } catch {}
  });
  const selected = Array.from(links)
    .sort((a, b) => Number(/about|service|contact|pricing|product/i.test(b)) - Number(/about|service|contact|pricing|product/i.test(a)))
    .filter((link) => link !== url)
    .slice(0, 4);
  for (const pageUrl of selected) {
    const html = await fetchHtml(pageUrl);
    if (html) pages.push(analyzePage(pageUrl, html));
  }
  return pages;
}

function priorityFromScore(score: number): "critical" | "high" | "medium" | "low" {
  if (score < 45) return "critical";
  if (score < 70) return "high";
  if (score < 85) return "medium";
  return "low";
}

function categoryLabel(category: AuditCategory) {
  return AUDIT_CATEGORIES.find((item) => item.value === category)?.label || category;
}

function buildFallback(input: AuditInput, pages: CrawledPage[]): AiAudit {
  const home = pages[0];
  const name = input.businessName || new URL(input.website).hostname;
  const forms = pages.reduce((sum, page) => sum + page.forms, 0);
  const missingAlt = pages.reduce((sum, page) => sum + page.imagesMissingAlt, 0);
  const comments: AiAudit["developer_comments"] = [];
  const recommendations: AiAudit["recommendations"] = [];
  const sections: AiAudit["full_report_data"]["sections"] = [];

  for (const category of input.selectedCategories) {
    if (category === "redesign") {
      const finding = home?.h1[0]
        ? `The homepage leads with "${home.h1[0]}", with ${home.h2.length} detected supporting section headings.`
        : "The homepage does not expose a clear primary heading in the crawl.";
      comments.push({
        category, priority: "high", heading: "Homepage hierarchy needs a clearer conversion path",
        finding,
        recommendation: "Modernize the hero, clarify the value proposition, strengthen the primary call to action, and organize content around services, proof, process, and enquiry.",
        evidence: `${forms} form(s), ${home?.ctas.length || 0} CTA label(s), mobile score ${input.scores.mobile}/100.`,
        strength: false,
      });
      recommendations.push({
        category, priority: "high", title: "Modernize the homepage and user journey", finding,
        recommendation: "Use a modern visual hierarchy, consistent branding, focused navigation, trust sections, mobile-first spacing, and repeated high-intent calls to action.",
        business_impact: "A clearer and more credible experience can help more visitors understand the offer and take the next step.",
      });
      sections.push({
        category, heading: "Re-Design and UX Analysis",
        analysis: "The redesign review focuses on visual hierarchy, navigation, mobile presentation, trust, branding, and conversion flow.",
        findings: [finding, `${forms} form(s) and ${home?.ctas.length || 0} homepage CTA label(s) were detected.`],
        recommendations: ["Create a focused hero and modern content hierarchy.", "Improve navigation, mobile spacing, trust proof, and lead capture."],
      });
    }
    if (category === "fix_issues") {
      const evidence = input.issues.length ? input.issues.join("; ") : "No major HTML-level problem was detected.";
      comments.push({
        category, priority: priorityFromScore(Math.min(input.scores.accessibility, input.scores.bestPractices)),
        heading: "Technical and accessibility issues require a focused cleanup",
        finding: `${missingAlt} image(s) are missing useful alt text. The audit also detected: ${evidence}`,
        recommendation: "Resolve the highest-impact markup, accessibility, security, form, and browser-console issues, then regression-test key user journeys.",
        evidence, strength: input.issues.length === 0 && missingAlt === 0,
      });
      recommendations.push({
        category, priority: "high", title: "Stabilize and repair the website",
        finding: evidence,
        recommendation: "Fix detected errors, repair accessibility gaps, validate forms and links, remove insecure patterns, and test critical pages across browsers and devices.",
        business_impact: "A stable website protects trust and prevents broken interactions from losing enquiries.",
      });
      sections.push({
        category, heading: "Technical Issues and Stability",
        analysis: "This section covers only detected technical, accessibility, security, and functional risks.",
        findings: [...input.issues.slice(0, 5), `${missingAlt} image(s) are missing useful alt text.`],
        recommendations: ["Fix critical technical and accessibility issues first.", "Regression-test forms, links, navigation, and key conversion paths."],
      });
    }
    if (category === "loading_speed") {
      const finding = `Performance scores ${input.scores.performance}/100 on desktop and ${input.scores.mobile}/100 on mobile.`;
      comments.push({
        category, priority: priorityFromScore(input.scores.performance), heading: "Loading speed can be improved",
        finding,
        recommendation: "Optimize images, reduce blocking scripts and styles, improve caching, and validate Core Web Vitals after each change.",
        evidence: input.issues.filter((issue) => /load|script|image|responsive|large|lazy/i.test(issue)).join("; ") || finding,
        strength: input.scores.performance >= 80,
      });
      recommendations.push({
        category, priority: priorityFromScore(input.scores.performance), title: "Improve Core Web Vitals and load time",
        finding,
        recommendation: "Compress and properly size images, remove unused assets, defer non-essential JavaScript, configure page caching, and reduce server response time.",
        business_impact: "Faster pages improve mobile usability, retention, and the effectiveness of paid and organic traffic.",
      });
      sections.push({
        category, heading: "Loading Speed and Core Web Vitals",
        analysis: "The performance review is limited to loading speed, responsive media, scripts, caching, and Core Web Vitals.",
        findings: [finding, ...input.issues.filter((issue) => /load|script|image|responsive|large|lazy/i.test(issue)).slice(0, 4)],
        recommendations: ["Optimize image delivery and responsive formats.", "Reduce blocking code, improve caching, and measure Core Web Vitals."],
      });
    }
    if (category === "seo") {
      const finding = `SEO score is ${input.scores.seo}/100. The homepage has ${home?.h1.length || 0} H1 heading(s) and ${home?.description ? "a detected" : "no detected"} meta description.`;
      comments.push({
        category, priority: priorityFromScore(input.scores.seo), heading: "Search visibility has clear on-page opportunities",
        finding,
        recommendation: "Improve page titles, meta descriptions, heading structure, internal links, image text alternatives, and service-page content based on search intent.",
        evidence: `Crawled ${pages.length} page(s); homepage title: "${home?.title || "not detected"}".`,
        strength: input.scores.seo >= 80,
      });
      recommendations.push({
        category, priority: priorityFromScore(input.scores.seo), title: "Strengthen on-page and technical SEO",
        finding,
        recommendation: "Give each important page a unique search-focused title, persuasive meta description, one clear H1, useful internal links, indexable content, and valid technical SEO signals.",
        business_impact: "A stronger search foundation can improve visibility and attract more relevant visitors.",
      });
      sections.push({
        category, heading: "SEO Improvements",
        analysis: "The SEO review focuses only on on-page structure, metadata, content clarity, internal linking, crawlability, and technical search signals.",
        findings: [finding, `${missingAlt} image(s) are missing useful alt text.`],
        recommendations: ["Optimize metadata, headings, content, and internal links.", "Resolve technical SEO and image accessibility gaps."],
      });
    }
    if (category === "maintenance") {
      const services = [
        "WordPress core, plugin, and theme updates",
        "Security monitoring and malware scanning",
        "Daily backup management and restore checks",
        "Uptime monitoring and monthly website checks",
        "Performance optimization and technical support",
      ];
      comments.push({
        category, priority: "high", heading: "The website needs a consistent preventive care process",
        finding: "The audit provides a point-in-time snapshot, but updates, security, backups, uptime, and performance require ongoing monitoring.",
        recommendation: "Use a monthly maintenance plan with controlled updates, security scans, off-site backups, uptime alerts, performance checks, and support time.",
        evidence: `Current best-practices score: ${input.scores.bestPractices}/100; performance score: ${input.scores.performance}/100.`,
        strength: false,
      });
      recommendations.push({
        category, priority: "high", title: "Introduce managed monthly website maintenance",
        finding: "Ongoing updates and monitoring are not verifiable from a public crawl.",
        recommendation: services.join("; ") + ".",
        business_impact: "Preventive maintenance reduces security exposure, downtime, performance decline, and emergency repair costs.",
      });
      sections.push({
        category, heading: "Website Maintenance Recommendations",
        analysis: "This section covers ongoing WordPress care, security, backups, uptime, optimization, monthly checks, and technical support.",
        findings: ["Public audits cannot confirm whether updates, backups, restore tests, and security monitoring are being completed consistently."],
        recommendations: services,
      });
    }
    if (category === "design_improvements") {
      comments.push({
        category, priority: "high", heading: "Layout and visual aesthetics can be modernized",
        finding: "While the underlying content is solid, the presentation lacks modern UI refinements.",
        recommendation: "Apply improved spacing, consistent typography, subtle animations, and updated UI components to elevate the visual appeal without a full rebuild.",
        evidence: `Mobile score is ${input.scores.mobile}/100. Modernizing the UI can improve user engagement metrics.`,
        strength: false,
      });
      recommendations.push({
        category, priority: "high", title: "Implement Website Design Improvements",
        finding: "The current design feels slightly outdated and could benefit from visual polish.",
        recommendation: "Introduce refined spacing, better contrast, modern typography, and interactive UI elements while preserving existing content.",
        business_impact: "A polished, modern look builds trust faster and decreases bounce rates, leading to higher conversion.",
      });
      sections.push({
        category, heading: "Design Enhancement Opportunities",
        analysis: "This review focuses on visual styling, layout spacing, modern UI trends, and user experience without changing core functionality.",
        findings: ["The interface lacks the premium feel of modern web applications.", "Spacing and typography could be optimized for better readability."],
        recommendations: ["Upgrade UI components (buttons, cards, forms).", "Improve whitespace and typographic hierarchy.", "Enhance mobile responsiveness and navigation."],
      });
    } else if (!["redesign", "fix_issues", "loading_speed", "seo", "maintenance", "design_improvements"].includes(category)) {
      const label = categoryLabel(category);
      comments.push({
        category, priority: "medium", heading: `Opportunities identified for ${label}`,
        finding: "Automated analysis indicates room for improvement in this area based on industry standards.",
        recommendation: `Implement best practices for ${label} to improve overall website effectiveness and user experience.`,
        evidence: "Review based on current website architecture and visible public metrics.",
        strength: false,
      });
      recommendations.push({
        category, priority: "medium", title: `Enhance ${label}`,
        finding: "Current implementation does not fully leverage modern standards.",
        recommendation: `Develop and apply a tailored strategy for ${label} aligned with your business goals.`,
        business_impact: "Resolving these gaps will directly support business growth and improve the user journey.",
      });
      sections.push({
        category, heading: `${label} Analysis`,
        analysis: `This section focuses on reviewing the website's approach to ${label}.`,
        findings: ["There are clear opportunities to modernize and optimize this aspect of the website."],
        recommendations: [`Prioritize strategic updates related to ${label}.`],
      });
    }
  }

  const labels = input.selectedCategories.map(categoryLabel);
  const scope = recommendations.map((item) => item.recommendation);
  const findings = comments.map((item) => item.finding);
  const overview = `${name} was reviewed specifically for ${labels.join(", ")}. The report intentionally excludes services outside that selected scope and prioritizes the findings most relevant to the proposed work.`;

  return {
    selected_categories: input.selectedCategories,
    audit_summary: {
      overview,
      strengths: comments.filter((item) => item.strength).map((item) => item.finding),
      priority_issues: comments.filter((item) => !item.strength).map((item) => item.finding),
    },
    developer_comments: comments,
    recommendations,
    proposal_content: {
      title: `${labels.join(" + ")} Proposal`,
      subject: `Focused website improvement proposal for ${name}`,
      executive_pitch: `${overview} The recommended work is based on measured scores and crawled website evidence.`,
      scope,
      expected_outcomes: recommendations.map((item) => item.business_impact),
      call_to_action: "Book a short consultation to confirm priorities, scope, and implementation timing.",
      email_subject: `${labels.join(" + ")} opportunities for ${name}`,
      email_body: `Hi ${name},\n\nI reviewed ${input.website} specifically for ${labels.join(" + ")} and found several focused opportunities worth addressing.\n\nI have prepared a detailed web report with my findings and recommended action plan.\n\nWould you be open to a short consultation to review the priorities? You are also welcome to reply directly to this email with any questions.\n\nBest regards,\nHassan----`,
      maintenance_pricing: {
        included: input.selectedCategories.includes("maintenance"),
        plan_name: input.selectedCategories.includes("maintenance") ? "Monthly Website Care Plan" : "",
        price_note: input.selectedCategories.includes("maintenance") ? "Pricing is confirmed after reviewing the website stack, update risk, and support requirements." : "",
        services: input.selectedCategories.includes("maintenance")
          ? ["System, plugin, and theme updates", "Security and malware monitoring", "Automated backups and restore checks", "Uptime monitoring", "Small fixes and text changes", "Monthly technical support"]
          : [],
      },
    },
    png_report_data: {
      headline: `${labels.join(" + ")} Audit for ${name}`,
      score_label: `Overall audit score: ${input.scores.overall}/100`,
      findings: findings.slice(0, 8),
      recommendations: scope.slice(0, 8),
      developer_comments: comments.map((item) => `${item.heading}: ${item.recommendation}`).slice(0, 6),
    },
    full_report_data: {
      executive_summary: overview,
      sections,
      action_plan: recommendations
        .sort((a, b) => ["critical", "high", "medium", "low"].indexOf(a.priority) - ["critical", "high", "medium", "low"].indexOf(b.priority))
        .map((item) => item.recommendation),
    },
  };
}

function formatPrompt(input: AuditInput, pages: CrawledPage[]) {
  const selected = input.selectedCategories.map((category) => `${category}: ${categoryLabel(category)}`);
  return `You are an elite digital agency strategist, senior UX/UI designer, and conversion rate optimization expert. 

Your main goal is to generate a short, persuasive audit report based ONLY on real crawled website data, screenshots, detected elements, and selected proposal categories. The report must feel manually reviewed, specific, professional, and useful for converting a business owner into a client.

SELECTED CATEGORIES:
${selected.join("\n")}

REPORT RULES:
1. Never repeat the same finding, recommendation, service name, or sentence in multiple sections.
2. Do not make unsupported claims. Do not say "form missing" unless the crawler confirms there is no form, widget, popup, iframe, or external appointment system. If detection is uncertain, write: "No clearly detectable appointment form was found during the automated review. Manual confirmation is recommended."
3. Do not use vague phrases like "Improve the website", "Modernize the design", "Better user experience", "Improve conversion", or "Strong branding" unless you explain exactly what should change and why.
4. Every finding must include: Issue, Evidence from the website, Why it matters, Recommended improvement, Priority (High, Medium, Low), and Fix type (Quick Fix, Website Change, Redesign, SEO, Technical, or Conversion).
5. Only show findings related to the selected proposal categories. Do not include unrelated SEO, speed, security, accessibility, or technical issues.
6. Use plain English. Avoid technical jargon unless needed.
7. Keep the report concise. Show a maximum of 5 high-value findings. Do not create long lists of weak issues.
8. Use the business name naturally only once in the introduction. Do not repeat it in every section.
9. Do not use fake guarantees, exaggerated promises, or phrases such as: Guaranteed results, Guaranteed strategy, Increase conversions immediately, Fix everything, Best redesign, Perfect website.
10. If screenshots are available, connect each finding to the relevant screenshot or page section.

REQUIRED REPORT STRUCTURE:
1. Executive Summary (proposal_content.executive_pitch): If "Complete Re-Design" is selected, this MUST be the short, professional redesign summary described in the Dynamic Category Handling section below. Otherwise, write 2-3 short sentences explaining the most important website opportunity based on the selected categories.
2. Priority Findings (Output as developer_comments & recommendations arrays): Use this format mentally and adapt it to the JSON schema: Priority, Fix Type, Issue, Evidence, Why It Matters, Recommended Fix.
3. Recommended Scope: A short list of only the work needed to resolve the priority findings. Do not repeat findings word-for-word.
4. Free Demo Offer: Only include this if "Complete Re-Design" is selected. Write: "I can create a free homepage redesign concept to show how the website could look with a clearer layout, stronger trust sections, and a more focused enquiry path. There is no obligation to continue with the full redesign."
5. Next Step: One simple CTA: "Reply if you would like me to prepare the free homepage concept or discuss the priority improvements."
6. Email Body (email_body): Write the email exactly using this template, replacing the bracketed information:
"Hi [Business Name],

I reviewed [Website URL] specifically for [Selected Categories] and found several focused opportunities worth addressing.

I have prepared a detailed web report with my findings and recommended action plan.

Would you be open to a short consultation to review the priorities? You are also welcome to reply directly to this email with any questions.

Best regards,
Hassan----"

DYNAMIC CATEGORY HANDLING:
- Website Changes & Content Updates: prioritize broken links, layout, mobile issues, missing CTAs, content, form, button, and navigation issues.
- Website Design Improvements: prioritize layout refinements, visual styling updates, improved spacing and typography, modern UI enhancements, mobile responsiveness, navigation improvements, and overall user experience upgrades while preserving the current content and structure.
- Complete Re-Design: Write a short, professional redesign summary based on the website audit. Clearly explain if the current website looks outdated or does not follow modern design and user-experience standards. Mention relevant improvement areas (visual design, mobile responsiveness, page structure, navigation, trust elements, calls to action, speed, accessibility, conversion flow). Use simple, client-friendly English with a helpful, professional tone (not overly negative). Focus on why a redesign will improve the visitor experience and generate more enquiries/leads. Example: "Your website design looks outdated and does not meet current user experience or design standards. A redesign is recommended to improve the visual appearance, mobile experience, page structure, trust elements, calls to action, and overall conversion flow. The updated design should follow modern website trends while keeping the brand professional, clear, and easy for visitors to use."
- SEO: prioritize titles, headings, local SEO, service pages, internal links, metadata, and content gaps.
- Technical Fixes: prioritize speed, mobile performance, broken forms, console errors, security, image optimization, and browser issues.

OUTPUT REQUIREMENTS:
- Use clean headings and bullets.
- Do not show duplicate content.
- Do not invent data. If data is missing, say "Not enough automated evidence was available to confirm this."
- Make the final report feel like a professional agency audit, not an AI-generated checklist.

Uploaded reference images (including full-page desktop and mobile screenshots) are attached after the text prompt in the same order as uploadedReferenceImages. Inspect them deeply when available, mention the supplied caption, describe clearly visible evidence, and connect relevant visual issues to recommendations. Do not infer hidden behavior from a screenshot.

The returned selected_categories must exactly match the selected categories above. Every developer comment, recommendation, and full report section must use one of those selected categories. The PNG data must contain only selected-category findings.

WEBSITE EVIDENCE:
${JSON.stringify({
  website: input.website,
  businessName: input.businessName,
  selectedCategories: input.selectedCategories,
  scores: input.scores,
  detectedIssues: input.issues,
  renderedDesignAnalysis: input.designAnalysis,
  uploadedReferenceImages: input.referenceImages?.map((image, index) => ({
    imageNumber: index + 1,
    type: image.type,
    section: image.section,
    caption: image.caption,
  })),
  crawledPages: pages,
}, null, 2)}

Return the requested structured JSON.`;
}

async function loadImageParts(images: ReportMediaItem[] = []) {
  const parts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
  for (const image of images.slice(0, 4)) {
    try {
      let bytes: Buffer;
      let mimeType = image.fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      if (image.url.startsWith("http")) {
        const response = await fetch(image.url);
        if (!response.ok) continue;
        mimeType = response.headers.get("content-type") || mimeType;
        bytes = Buffer.from(await response.arrayBuffer());
      } else {
        const relativePath = image.url.replace(/^\/+/, "");
        const fullPath = path.resolve(process.cwd(), "public", relativePath);
        if (!fullPath.startsWith(path.resolve(process.cwd(), "public") + path.sep)) continue;
        bytes = await readFile(fullPath);
      }
      if (bytes.length > 4_000_000) continue;
      parts.push({ inlineData: { mimeType, data: bytes.toString("base64") } });
    } catch {}
  }
  return parts;
}

async function callGemini(prompt: string, images: ReportMediaItem[] = [], modelOverride?: string | null) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const model = modelOverride?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const imageParts = await loadImageParts(images);
    const request = async (useJsonSchema: boolean, modelName: string) => {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }, ...imageParts] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 12_000,
            responseMimeType: "application/json",
            [useJsonSchema ? "responseJsonSchema" : "responseSchema"]: responseSchema,
          },
        }),
        signal: controller.signal,
      });
      return { response, payload: await response.json() };
    };
    let result = await request(true, model);
    if (!result.response.ok && result.response.status === 404) {
      result = await request(true, "gemini-2.0-flash");
    }
    if (!result.response.ok && result.response.status === 400) {
      result = await request(false, "gemini-2.0-flash");
    }
    if (!result.response.ok) throw new Error(result.payload?.error?.message || `Gemini request failed with ${result.response.status}`);
    const text = result.payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!text) throw new Error("Gemini returned no structured content");
    return aiAuditSchema.parse(JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim()));
  } finally {
    clearTimeout(timeout);
  }
}

function validateCategoryScope(audit: AiAudit, selected: AuditCategory[]) {
  const expected = new Set(selected);
  const actual = new Set(audit.selected_categories);
  if (expected.size !== actual.size || selected.some((category) => !actual.has(category))) {
    throw new Error("Gemini returned categories outside the selected scope");
  }
  const scoped = [
    ...audit.developer_comments.map((item) => item.category),
    ...audit.recommendations.map((item) => item.category),
    ...audit.full_report_data.sections.map((item) => item.category),
  ];
  if (scoped.some((category) => !expected.has(category))) {
    throw new Error("Gemini returned unselected category content");
  }
}

export async function generateAiAudit(input: AuditInput): Promise<{ audit: AiAudit; source: "gemini" | "fallback"; warning?: string }> {
  const prisma = getPrisma();
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  
  const selectedCategories = Array.from(new Set(input.selectedCategories));
  if (selectedCategories.length === 0) throw new Error("Select at least one audit category");
  const scopedInput = { ...input, selectedCategories };
  const pages = await crawlWebsite(input.website, input.homepageHtml);
  const fallback = buildFallback(scopedInput, pages);
  try {
    const audit = await callGemini(formatPrompt(scopedInput, pages), input.referenceImages, settings?.geminiModel);
    validateCategoryScope(audit, selectedCategories);
    return { audit, source: "gemini" };
  } catch (error) {
    const warning = error instanceof Error ? error.message : "Gemini generation failed";
    console.warn("Using category-aware audit fallback:", warning);
    return { audit: fallback, source: "fallback", warning };
  }
}

export function getAiAudit(value: unknown): AiAudit | null {
  const parsed = aiAuditSchema.safeParse(value);
  if (!parsed.success) {
    console.error("AI Audit validation failed:", parsed.error);
    return null;
  }
  return parsed.data;
}

export function formatDeveloperComments(audit: AiAudit) {
  return audit.developer_comments
    .map((comment) => `${comment.heading}: ${comment.finding} Recommendation: ${comment.recommendation}`)
    .join("\n");
}
