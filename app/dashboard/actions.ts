"use server";

import * as cheerio from "cheerio";
import { getPrisma } from "@/lib/prisma";
import { auditWebsiteHtml } from "@/lib/site-audit";
import { launchBrowser } from "@/lib/browser";
import { getLeadAiFields, saveLeadReportContent } from "@/lib/lead-ai-storage";
import { revalidatePath, revalidateTag } from "next/cache";
import { sendLeadEmail } from "@/lib/email-actions";
import { detectBusinessCategory } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";


export async function quickAnalyzeWebsite(url: string) {
  const prisma = getPrisma();
  try {
    const normalizeUrl = (u: string) => {
      let cleaned = u.trim();
      if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
        cleaned = "https://" + cleaned;
      }
      return cleaned;
    };
    
    let targetUrl = normalizeUrl(url);
    let parsedUrl = new URL(targetUrl);
    

    let baseOrigin = parsedUrl.origin;
    const isYelp = targetUrl.includes("yelp.com/biz/");

    let emails = new Set<string>();
    let phones = new Set<string>();
    let contactFormExists = false;
    let socialLinks = new Set<string>();
    let title = "";
    let metaDescription = "";
    let address = "";
    let contactPageUrl = "";
    let pageHtml = "";

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000); 
      
      const res = await fetch(targetUrl, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
        },
        next: { revalidate: 0 },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (res.ok) {
        const html = await res.text();
        pageHtml = html;
        const $ = cheerio.load(html);

        title = $("title").text().trim();
        metaDescription = $("meta[name='description']").attr("content") || "";

        const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi;
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

        const extractFromText = (text: string) => {
          const e = text.match(emailRegex);
          if (e) e.forEach(m => emails.add(m.toLowerCase()));
          const p = text.match(phoneRegex);
          if (p) p.forEach(m => phones.add(m));
        };

        if (isYelp) {
           title = $('meta[property="og:title"]').attr('content') || title;
           address = $('address').text().trim() || "";
           let yelpWebsite = "";
           $('a').each((i, el) => {
              const href = $(el).attr('href');
              if (href && href.includes('/biz_redir?url=')) {
                  const match = href.match(/url=([^&]+)/);
                  if (match) {
                      yelpWebsite = decodeURIComponent(match[1]);
                  }
              }
           });
           
           const yelpText = $("body").text();
           const p = yelpText.match(phoneRegex);
           if (p) {
               const cleanP = p.filter(n => n.length >= 10);
               if (cleanP.length > 0) phones.add(cleanP[0]);
           }

           if (yelpWebsite) {
              targetUrl = normalizeUrl(yelpWebsite);
              parsedUrl = new URL(targetUrl);
              baseOrigin = parsedUrl.origin;
              
              try {
                const webRes = await fetch(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 }, cache: 'no-store' });
                if (webRes.ok) {
                   const webHtml = await webRes.text();
                   const $web = cheerio.load(webHtml);
                   extractFromText($web("body").text());
                   if (!address) {
                     const addressPatterns = [/(\d{1,5}\s+[\w\s]{5,50}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|square|sq|plaza|plz|zip|postal|city|state))/gi];
                     addressPatterns.forEach(pattern => {
                       const match = $web("body").text().match(pattern);
                       if (match && !address) address = match[0].trim();
                     });
                   }
                }
              } catch (e) {}
           }
        } else {
            extractFromText($("body").text());

            const addressPatterns = [/(\d{1,5}\s+[\w\s]{5,50}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|square|sq|plaza|plz|zip|postal|city|state))/gi];
            addressPatterns.forEach(pattern => {
              const match = $("body").text().match(pattern);
              if (match && !address) address = match[0].trim();
            });

            $("a").each((_, el) => {
              const href = $(el).attr("href");
              if (!href) return;
              if (href.startsWith("mailto:")) emails.add(href.replace("mailto:", "").trim().toLowerCase());
              if (href.startsWith("tel:")) phones.add(href.replace("tel:", "").trim());
              
              const lower = href.toLowerCase();
              if (lower.includes("facebook.com") || lower.includes("twitter.com") || lower.includes("linkedin.com") || lower.includes("instagram.com") || lower.includes("youtube.com")) {
                socialLinks.add(href);
              }

              if (lower.includes("contact") || lower.includes("get-in-touch") || lower.includes("support")) {
                if (!contactPageUrl) {
                  if (href.startsWith("http")) {
                    if (href.includes(parsedUrl.hostname)) contactPageUrl = href;
                  } else if (href.startsWith("/")) {
                    contactPageUrl = baseOrigin + href;
                  }
                }
              }
            });

            if (contactPageUrl) {
              try {
                const cRes = await fetch(contactPageUrl, { next: { revalidate: 0 }, cache: 'no-store' });
                if (cRes.ok) {
                   const cHtml = await cRes.text();
                   const $c = cheerio.load(cHtml);
                   extractFromText($c("body").text());
                   if ($c("form").length > 0) contactFormExists = true;
                }
              } catch (e) {}
            }
        }
      }
    } catch (e) {
      console.error("Extraction failed, but continuing to PageSpeed:", e);
    }

    const audit = auditWebsiteHtml(pageHtml, targetUrl);
    const perfScore = audit.performanceScore;
    const seoScore = audit.seoScore;
    const accScore = audit.accessibilityScore;
    const bpScore = audit.bestPracticesScore;
    const mScore = audit.mobileScore;
    const dScore = audit.desktopScore;
    
    const overallScore = Math.round((perfScore + seoScore + accScore + bpScore) / 4);

    let leadScore = 100;
    if (perfScore < 50) leadScore -= 30;
    else if (perfScore < 80) leadScore -= 15;
    if (seoScore < 70) leadScore -= 20;
    if (overallScore < 60) leadScore -= 10;

    let leadStatus = "Good Website";
    if (leadScore < 60 || perfScore < 50) leadStatus = "Hot Lead";
    else if (leadScore < 80 || perfScore < 75) leadStatus = "Warm Lead";

    const getBusinessName = (title: string, hostname: string) => {
      // Prioritize common separators that define a business name vs a tagline
      const separators = [" | ", " - ", " : ", " – ", " — "];
      let name = title;
      
      for (const sep of separators) {
        if (name.includes(sep)) {
          const parts = name.split(sep);
          // Pick the part that doesn't look like a generic tagline (longer parts are often taglines)
          name = parts.reduce((a, b) => a.length <= b.length ? a : b);
          break;
        }
      }

      // If the result is too generic or short, fallback to hostname
      const genericWords = ["home", "welcome", "world", "index", "website"];
      if (!name || name.length < 3 || genericWords.includes(name.toLowerCase().trim())) {
        return hostname.replace("www.", "").split(".")[0].charAt(0).toUpperCase() + hostname.replace("www.", "").split(".")[0].slice(1);
      }
      
      return name.trim();
    };

    const businessName = getBusinessName(title, parsedUrl.hostname);
    const extractedData = {
      businessName,
      website: targetUrl,
      email: Array.from(emails).join(", "),
      phone: Array.from(phones).join(", "),
      address: address || "Not found",
      socialLinks: Array.from(socialLinks).join(", "),
      contactPageUrl: contactPageUrl || "Not found",
      overallScore,
      performanceScore: perfScore,
      seoScore,
      accessibilityScore: accScore,
      bestPracticesScore: bpScore,
      mobileScore: mScore,
      desktopScore: dScore,
      leadScore,
      status: leadStatus,
      topIssues: audit.issues.length > 0
        ? audit.issues.join("\n")
        : "No major HTML-level issues detected",
      beforeAfterImage: null as string | null
    };

    // Check for valid DATABASE_URL before creating
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes("[REF]") || dbUrl.includes("[PASSWORD]")) {
      throw new Error("DATABASE_URL is not configured. Please set a valid PostgreSQL connection string in your .env file to save leads.");
    }

    // Classify the website using detectBusinessCategory
    const autoCategory = detectBusinessCategory(
      extractedData.businessName,
      title,
      metaDescription,
      targetUrl,
      pageHtml
    );

    const lead = await prisma.lead.create({
      data: {
        businessName: extractedData.businessName,
        website: extractedData.website,
        email: extractedData.email,
        phone: extractedData.phone,
        address: extractedData.address,
        category: autoCategory, // Auto-assign category
        status: extractedData.status,
        leadScore: extractedData.leadScore,
        websiteScore: extractedData.overallScore,
        performanceScore: extractedData.performanceScore,
        seoScore: extractedData.seoScore,
        accessibilityScore: extractedData.accessibilityScore,
        bestPracticesScore: extractedData.bestPracticesScore,
        pageSpeedPerformance: extractedData.performanceScore,
        pageSpeedSeo: extractedData.seoScore,
        pageSpeedAccessibility: extractedData.accessibilityScore,
        pageSpeedBestPractices: extractedData.bestPracticesScore,
        mobileScore: extractedData.mobileScore,
        desktopScore: extractedData.desktopScore,
        topIssues: extractedData.topIssues,
        notes: `Contact Page: ${extractedData.contactPageUrl}\nSocials: ${extractedData.socialLinks}`
      }
    });

    // Do NOT capture screenshot on analyze. Screenshot generation is deferred to report generation.

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    
    return { success: true, data: { ...extractedData, leadId: lead.id }, leadId: lead.id };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getDashboardStats() {
  const prisma = getPrisma();
  
  // Format today's date in local date string format (YYYY-MM-DD)
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const localDate = new Date(Date.now() - tzOffset);
  const todayStr = localDate.toISOString().split("T")[0];

  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const searchUsage = await prisma.searchUsage.findUnique({
      where: { date: todayStr }
    });
    
    const googleLimit = settings?.googleSearchLimit ?? 40;
    const serpLimit = settings?.serpApiSearchLimit ?? 40;

    const googleUsed = searchUsage?.googleCount || 0;
    const serpUsed = searchUsage?.serpCount || 0;

    const searchesUsed = googleUsed + serpUsed;
    const remainingSearches = Math.max(0, (googleLimit + serpLimit) - searchesUsed);

    const totalLeads = await prisma.lead.count();
    const leadsSaved = await prisma.lead.count({
      where: {
        status: { not: "Finder" }
      }
    });

    const emailsSent = await prisma.emailLog.count();

    const hotLeads = await prisma.lead.count({ where: { status: "Hot Lead" } });
    const contactedLeads = await prisma.lead.count({ where: { status: "Contacted" } });
    const wonLeads = await prisma.lead.count({ where: { status: "Won" } });

    return {
      searchesUsed,
      remainingSearches,
      totalLeads,
      leadsSaved,
      emailsSent,
      hotLeads,
      contactedLeads,
      wonLeads
    };
  } catch (error) {
    return {
      searchesUsed: 0,
      remainingSearches: 80,
      totalLeads: 0,
      leadsSaved: 0,
      emailsSent: 0,
      hotLeads: 0,
      contactedLeads: 0,
      wonLeads: 0
    };
  }
}

export async function updateLeadStatus(leadId: string, status: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadEmail(leadId: string, email: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { email }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadCategory(leadId: string, category: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { category }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/lead-finder");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLead(leadId: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.delete({
      where: { id: leadId }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSettings() {
  const prisma = getPrisma();
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "default" }
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "default" }
      });
    }
    return settings;
  } catch (error) {
    return null;
  }
}

export async function getLeads(filters?: { search?: string; status?: string; category?: string }) {
  const prisma = getPrisma();
  try {
    const where: any = {};
    if (filters?.search && filters.search.trim() !== "") {
      const s = filters.search.trim();
      where.OR = [
        { businessName: { contains: s, mode: "insensitive" } },
        { website: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { city: { contains: s, mode: "insensitive" } },
        { address: { contains: s, mode: "insensitive" } },
        { notes: { contains: s, mode: "insensitive" } },
      ];
    }
    if (filters?.status && filters.status !== "All") {
      where.status = filters.status;
    } else {
      where.status = { not: "Finder" };
    }
    if (filters?.category && filters.category !== "All") {
      where.category = filters.category;
    }

    return await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        businessName: true,
        website: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        category: true,
        source: true,
        status: true,
        leadScore: true,
        websiteScore: true,
        performanceScore: true,
        seoScore: true,
        pageSpeedPerformance: true,
        pageSpeedSeo: true,
        accessibilityScore: true,
        bestPracticesScore: true,
        desktopScore: true,
        mobileScore: true,
        topIssues: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    console.error("GET_LEADS_ERROR:", error);
    throw error;
  }
}

export async function getPaginatedLeads(filters: { search?: string; status?: string; category?: string; page?: number; limit?: number; sortField?: string; sortOrder?: string }) {
  const prisma = getPrisma();
  try {
    const where: any = {};
    if (filters?.search && filters.search.trim() !== "") {
      const s = filters.search.trim();
      where.OR = [
        { businessName: { contains: s, mode: "insensitive" } },
        { website: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { city: { contains: s, mode: "insensitive" } },
        { address: { contains: s, mode: "insensitive" } },
        { notes: { contains: s, mode: "insensitive" } },
      ];
    }
    if (filters?.status && filters.status !== "All") {
      where.status = filters.status;
    } else {
      where.status = { not: "Finder" };
    }
    if (filters?.category && filters.category !== "All") {
      where.category = filters.category;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = filters.sortField || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          businessName: true,
          website: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          category: true,
          source: true,
          status: true,
          leadScore: true,
          websiteScore: true,
          performanceScore: true,
          seoScore: true,
          pageSpeedPerformance: true,
          pageSpeedSeo: true,
          accessibilityScore: true,
          bestPracticesScore: true,
          desktopScore: true,
          mobileScore: true,
          topIssues: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    return {
      leads,
      total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error("GET_PAGINATED_LEADS_ERROR:", error);
    throw error;
  }
}

export async function bulkUpdateLeadStatus(leadIds: string[], status: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { status }
    });
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateLeadCategory(leadIds: string[], category: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { category }
    });
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteLeads(leadIds: string[]) {
  const prisma = getPrisma();
  try {
    await prisma.lead.deleteMany({
      where: { id: { in: leadIds } }
    });
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSettings(data: any) {
  const prisma = getPrisma();
  try {
    await prisma.settings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTemplates() {
  const prisma = getPrisma();
  try {
    return await prisma.emailTemplate.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}

export async function getLeadAction(leadId: string) {
  const prisma = getPrisma();
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return null;
    const aiFields = await getLeadAiFields(prisma, leadId);
    return { ...lead, ...aiFields };
  } catch (error) {
    return null;
  }
}

export async function getMediaAssetsAction() {
  const prisma = getPrisma();
  try {
    return await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  } catch (error) {
    return [];
  }
}

export async function sendLeadEmailFromDashboard(leadId: string, subject: string, body: string, toEmail: string) {
  return sendLeadEmail(leadId, null, body, subject, toEmail);
}

export async function getLeadStats() {
  const prisma = getPrisma();
  try {
    const totalLeads = await prisma.lead.count({ where: { status: { not: "Finder" } } });
    
    // Count leads with valid email
    const withEmail = await prisma.lead.count({
      where: {
        status: { not: "Finder" },
        AND: [
          { email: { not: null } },
          { email: { not: "" } }
        ]
      }
    });
    
    const withoutEmail = Math.max(0, totalLeads - withEmail);

    // Group leads by category to get category counts
    const categoryGroup = await prisma.lead.groupBy({
      by: ["category"],
      where: { status: { not: "Finder" } },
      _count: { _all: true }
    });

    const categoryCounts: Record<string, number> = {};
    categoryGroup.forEach(group => {
      const cat = group.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + group._count._all;
    });

    // Counts for leads created in the last 24h
    const recentlyAdded = await prisma.lead.count({
      where: {
        status: { not: "Finder" },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    return {
      totalLeads,
      withEmail,
      withoutEmail,
      categoryCounts,
      recentlyAdded
    };
  } catch (error) {
    console.error("GET_LEAD_STATS_ERROR:", error);
    return {
      totalLeads: 0,
      withEmail: 0,
      withoutEmail: 0,
      categoryCounts: {},
      recentlyAdded: 0
    };
  }
}

export async function updateLeadDeveloperComments(leadId: string, comments: string) {
  const prisma = getPrisma();
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { developerComments: comments }
    });
    revalidatePath("/dashboard/leads");
    return true;
  } catch (error) {
    console.error("UPDATE_DEVELOPER_COMMENTS_ERROR:", error);
    return false;
  }
}

export async function updateCustomProposalContent(leadId: string, customHtml: string) {
  const prisma = getPrisma();
  try {
    const leadAi = await getLeadAiFields(prisma, leadId);
    const reportContent = (leadAi.reportContent as any) || {};
    reportContent.customProposal = customHtml;
    await saveLeadReportContent(prisma, leadId, reportContent);
    revalidatePath("/dashboard/leads");
    return true;
  } catch (error) {
    console.error("UPDATE_CUSTOM_PROPOSAL_ERROR:", error);
    return false;
  }
}

export async function enhanceDeveloperComments(rawComments: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const model = settings?.geminiModel?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `You are a professional senior web developer auditing a client website based on the provided raw notes.
I want you to analyze the website's design (via the notes) and generate professional developer comments based on its UI, UX, layout, and conversion opportunities. The feedback should be written in simple, easy-to-understand English, as if a web developer is giving constructive advice to a client.

The comments should:
* Focus only on what is visible on the website (as mentioned in the notes).
* Identify design, layout, usability, and conversion issues.
* Explain why each issue matters.
* Suggest practical improvements in a positive, professional tone.
* Avoid technical jargon so non-technical clients can easily understand it.
* Never make assumptions about the website's backend or functionality unless they are clearly visible.
* Keep the feedback concise, personalized, and actionable.

The output MUST follow this exact format (return it as clean HTML tags like <p>, <ul>, <li>, <strong>, without any markdown wrappers or code blocks):
* A short introduction mentioning that the website was reviewed.
* A paragraph describing the main issues affecting user experience or conversions.
* A list of recommended improvements (using <ul> and <li>).
* End with a friendly call to action inviting the client to discuss a redesign.

The writing should sound natural and personalized—not like AI-generated content or a generic website audit. It should read like feedback from an experienced web developer who wants to help improve the website and increase conversions.

Raw Notes to base the audit on:
${rawComments}

Response constraints: Return ONLY the raw HTML string. Do NOT wrap it in \`\`\`html or any markdown.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
      }),
      signal: controller.signal
    });

    if (!response.ok && response.status === 404) {
      // Fallback if the user typed an invalid model name
      const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
      response = await fetch(fallbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        }),
      });
    }

    clearTimeout(timeout);

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }
    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response");
    return text.trim();
  } catch (error: any) {
    console.error("ENHANCE_COMMENTS_ERROR:", error);
    throw new Error(error.message || "Failed to rewrite comments");
  }
}

export async function autoCorrectText(text: string) {
  const prisma = getPrisma();
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const model = settings?.geminiModel?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `You are an AI proofreader. Fix any grammar, spelling, and clarity issues in the following text, while preserving the exact original meaning and tone.
Do not add any conversational filler, explanations, or quotes. Just return the corrected text.

Text to correct:
${text}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
      }),
      signal: controller.signal
    });

    if (!response.ok && response.status === 404) {
      // Fallback if the user typed an invalid model name
      const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
      response = await fetch(fallbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
        }),
      });
    }

    clearTimeout(timeout);

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }
    const json = await response.json();
    const resultText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Gemini returned an empty response");
    return resultText.trim();
  } catch (error: any) {
    console.error("AUTOCORRECT_ERROR:", error);
    throw new Error(error.message || "Failed to autocorrect text");
  }
}

export async function cancelFollowUp(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { followUpStatus: "Cancelled", followUpDate: null }
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function rescheduleFollowUp(leadId: string, date: Date) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { followUpStatus: "Scheduled", followUpDate: date }
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function markFollowUpReplied(leadId: string) {
  const prisma = getPrisma();
  await prisma.lead.update({
    where: { id: leadId },
    data: { followUpStatus: "Replied", followUpDate: null }
  });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function fetchPortfolioLinks(): Promise<{ success: boolean; items?: any[]; error?: string }> {
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } }) || await prisma.settings.findFirst();
    const portfolioUrl = settings?.portfolioUrl || "https://www.coreweblabs.com/portfolio";

    const res = await fetch(portfolioUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: Array<{
      title: string;
      category: string;
      description: string;
      url: string;
      image: string;
    }> = [];

    $("article").each((i, el) => {
      const $el = $(el);
      const title = $el.find("h3").text().trim();
      const category = $el.find("span").first().text().trim();
      const description = $el.find("p").text().trim();
      let url = $el.find("a[href]").attr("href") || "";
      let image = $el.find("img").attr("src") || $el.find("img").attr("srcSet") || "";

      if (image && image.includes("url=")) {
        try {
          const match = image.match(/url=([^&]+)/);
          if (match) {
            image = decodeURIComponent(match[1]);
          }
        } catch (e) {}
      }
      if (image && image.startsWith("/")) {
        try {
          const origin = new URL(portfolioUrl).origin;
          image = `${origin}${image}`;
        } catch (e) {
          image = `https://www.coreweblabs.com${image}`;
        }
      }
      if (url && url.startsWith("/")) {
        try {
          const origin = new URL(portfolioUrl).origin;
          url = `${origin}${url}`;
        } catch (e) {
          url = `https://www.coreweblabs.com${url}`;
        }
      }

      if (title && url) {
        items.push({ title, category, description, url, image });
      }
    });

    if (items.length === 0) {
      return { success: true, items: FALLBACK_PORTFOLIO };
    }
    return { success: true, items };
  } catch (error: any) {
    console.error("Error scraping portfolio:", error);
    return { success: true, items: FALLBACK_PORTFOLIO };
  }
}

const FALLBACK_PORTFOLIO = [
  {
    title: "Lawyers CoreWebLabs - Main Legal Hub",
    category: "Law Firms ⚖️",
    description: "A premium legal services portal and attorney directories landing hub for modern law practices and corporate law firms.",
    url: "https://lawyers.coreweblabs.com/",
    image: "https://www.coreweblabs.com/demo-screenshots/lawyers-main.jpg"
  },
  {
    title: "Lawia - Attorney & Lawyers React Template",
    category: "Law Firms ⚖️",
    description: "A premium React template for attorneys and law firms featuring clean legal consultations forms, lawyer bios, and case results counters.",
    url: "https://lawyers.coreweblabs.com/demo-01",
    image: "https://www.coreweblabs.com/demo-screenshots/lawyers-demo-1.jpg"
  },
  {
    title: "Lawgne - Corporate Law Firm Template",
    category: "Law Firms ⚖️",
    description: "An elegant corporate law firm template designed for corporate legal departments, attorneys, legal counselors, and consulting firms.",
    url: "https://lawyers.coreweblabs.com/demo-02",
    image: "https://www.coreweblabs.com/demo-screenshots/lawyers-demo-2.jpg"
  },
  {
    title: "Lawyers - Attorneys Business Template",
    category: "Law Firms ⚖️",
    description: "A classic trustworthy lawyers website template emphasizing practice areas, client testimonials, and online appointment requests.",
    url: "https://lawyers.coreweblabs.com/demo-03",
    image: "https://www.coreweblabs.com/demo-screenshots/lawyers-demo-3.jpg"
  },
  {
    title: "PrimeCare Dental & Implant Practice",
    category: "Dental Clinic",
    description: "A state-of-the-art, high-converting dental practice template engineered for patient bookings, cosmetic dentistry showcases, and seamless online scheduling.",
    url: "https://clinic.coreweblabs.com/",
    image: "https://www.coreweblabs.com/demo-screenshots/primecare.png"
  },
  {
    title: "SmileCraft Modern Dentistry",
    category: "Dental Clinic",
    description: "An ultra-clean, patient-centric dental clinic web interface featuring dynamic team profiles, comprehensive procedure breakdowns, and real-time review widgets.",
    url: "https://clinic.coreweblabs.com/demo-2",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-2.png"
  },
  {
    title: "Family Care Dental & Orthodontics",
    category: "Dental Clinic",
    description: "An elegant healthcare layout tailored for family dentistry and orthodontic clinics emphasizing comprehensive preventative care and pediatric dental solutions.",
    url: "https://clinic.coreweblabs.com/demo-3",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-3.png"
  },
  {
    title: "Apex Dental & Surgical Center",
    category: "Dental Clinic",
    description: "A feature-rich medical layout showcasing transparent dental pricing plans, emergency care contacts, and interactive treatment decision trees.",
    url: "https://clinic.coreweblabs.com/demo-4",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-4.png"
  },
  {
    title: "OmniDent Multi-Specialty Clinic",
    category: "Dental Clinic",
    description: "A robust multi-specialty clinical hub designed for group dental practices, integrating multi-doctor schedules, insurance checkers, and virtual consultation portals.",
    url: "https://clinic.coreweblabs.com/demo-5",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-5.png"
  },
  {
    title: "Radiant Smiles Aesthetic Dentistry",
    category: "Dental Clinic",
    description: "A sophisticated cosmetic dentistry template emphasizing before-and-after smile transformations, teeth whitening packages, and porcelain veneer guides.",
    url: "https://clinic.coreweblabs.com/demo-6",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-6.png"
  },
  {
    title: "Align & Shine Orthodontic Specialist",
    category: "Dental Clinic",
    description: "A modern orthodontic clinical portal highlighting clear aligner technology, 3D digital scanning process overviews, and custom treatment financing calculators.",
    url: "https://clinic.coreweblabs.com/dental-7",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-dental-7.png"
  },
  {
    title: "VisionCare Ophthalmology & Laser Center",
    category: "Eye Care & Ophthalmology",
    description: "A premium optometry and ophthalmology landing page packed with vision test scheduling, LASIK surgery guides, and optical eyewear showcases.",
    url: "https://clinic.coreweblabs.com/eye-1",
    image: "https://www.coreweblabs.com/demo-screenshots/eye-clinic-demo-1.png"
  },
  {
    title: "Optima Eye Specialists & Surgeons",
    category: "Eye Care & Ophthalmology",
    description: "An advanced optical care website designed to highlight modern diagnostic machinery, surgeon credentials, and comprehensive eye disease management.",
    url: "https://clinic.coreweblabs.com/eye-2",
    image: "https://www.coreweblabs.com/demo-screenshots/eye-clinic-demo-2.png"
  },
  {
    title: "ClearView Optometry & Designer Eyewear",
    category: "Eye Care & Ophthalmology",
    description: "A stylish optician and vision correction showcase combining routine eye examination scheduling with interactive designer frame catalog previews.",
    url: "https://clinic.coreweblabs.com/eye-3",
    image: "https://www.coreweblabs.com/demo-screenshots/eye-clinic-demo-3.png"
  },
  {
    title: "Precision Vision & Refractive Clinic",
    category: "Eye Care & Ophthalmology",
    description: "A modern refractive eye surgery web portal built for state-of-the-art vision correction, professional corneal exams, and personalized optical therapies.",
    url: "https://clinic.coreweblabs.com/eye-4/",
    image: "https://www.coreweblabs.com/demo-screenshots/eye-clinic-demo-4.png"
  },
  {
    title: "Lumina Beauty & Aesthetics Clinic",
    category: "Beauty & Aesthetics",
    description: "A premium cosmetic clinic website featuring AI facial analysis, advanced plastic surgery showcases, appointment booking, and a comprehensive gallery of aesthetic transformations.",
    url: "https://clinic.coreweblabs.com/demo-8",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-8.png"
  },
  {
    title: "MediZen Health & Medical Center",
    category: "General Healthcare",
    description: "A comprehensive health and medical clinic template with multi-home layouts, doctor profiles, service pages, project case studies, and patient appointment scheduling.",
    url: "https://clinic.coreweblabs.com/demo-9",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-9.png"
  },
  {
    title: "MediDental Premium Dental Surgery",
    category: "Dental Clinic",
    description: "A premium dental clinic and surgery website with multi-homepage options, transparent service showcases, doctor directories, project portfolios, and online appointment booking.",
    url: "https://clinic.coreweblabs.com/demo-10",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-10.png"
  },
  {
    title: "Pluxes Advanced Healthcare Services",
    category: "General Healthcare",
    description: "A premium medical and healthcare website template featuring multiple home versions, gallery pages, video galleries, testimonials, FAQ sections, and team doctor profiles.",
    url: "https://clinic.coreweblabs.com/demo-11",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-11.png"
  },
  {
    title: "Vamary Plastic Surgery & Medical Center",
    category: "Beauty & Aesthetics",
    description: "A sophisticated plastic surgery and medical center template with eight home styles, an integrated shop, doctor directories, case studies, and full eCommerce functionality.",
    url: "https://clinic.coreweblabs.com/demo-12",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-12.png"
  },
  {
    title: "Resox Physiotherapy & Chiropractic Clinic",
    category: "Physiotherapy & Rehabilitation",
    description: "A professional physiotherapy and chiropractic clinic website featuring service pages for massage therapy, sport injuries, clinical pilates, and an integrated appointment booking form.",
    url: "https://clinic.coreweblabs.com/demo-13",
    image: "https://www.coreweblabs.com/demo-screenshots/clinic-demo-13.png"
  }
];

export async function trackReportViewAction(leadId: string) {
  try {
    const prisma = getPrisma();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { success: false, error: "Lead not found" };

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    if ((!lead.reportViewedAt || lead.reportViewedAt < oneHourAgo) && !isAdmin) {
      const settings = await prisma.settings.findUnique({ where: { id: "default" } }) || await prisma.settings.findFirst();
      const resendApiKey = settings?.resendApiKey || process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);

        const companyName = settings?.companyName || "CoreWeb Labs";
        const siteUrl = settings?.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.coreweblabs.com";
        const leadUrl = `${siteUrl}/admin/leads/${lead.id}`;
        
        const senderName = settings?.senderName || companyName;
        const senderEmail = settings?.senderEmail || "notifications@coreweblabs.com";

        await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: "hassannaqvi@coreweblabs.com",
          subject: `🔥 HOT LEAD: ${lead.businessName || lead.website} just viewed their report!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Report Viewed!</h2>
              <p><strong>${lead.businessName || lead.website}</strong> just opened their Web Audit Report.</p>
              <p>This is a great time to give them a call or send a quick follow-up message while they are "warm".</p>
              <br/>
              <a href="${leadUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Lead in Dashboard</a>
            </div>
          `
        }).catch(console.error);
      }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        reportViewedAt: now,
        reportViewCount: { increment: 1 }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error tracking view:", error);
    return { success: false, error: error.message };
  }
}

export async function getMenuAction() {
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } }) || await prisma.settings.findFirst();
    const DEFAULT_MENU = [
      { id: "home", label: "Home", href: "/", visible: true },
      { id: "about", label: "About", href: "/about", visible: true },
      { id: "services", label: "Services", href: "/services", visible: true },
      { id: "portfolio", label: "Portfolio", href: "/portfolio", visible: true },
      { 
        id: "blog-dropdown",
        label: "Blog", 
        href: "/blog",
        visible: true,
        children: [
          { id: "articles", label: "Articles", href: "/blog", visible: true },
          { id: "videos", label: "Videos", href: "/videos", visible: true }
        ]
      },
      { id: "reviews", label: "Reviews", href: "/reviews", visible: true },
      { id: "contact", label: "Contact", href: "/contact", visible: true }
    ];
    return settings?.navItems || DEFAULT_MENU;
  } catch (error) {
    return [];
  }
}

export async function updateMenuAction(navItems: any) {
  try {
    const prisma = getPrisma();
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { navItems },
      create: { id: "default", navItems }
    });
    revalidateTag("settings", "default");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

