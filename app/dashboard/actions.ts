"use server";

import * as cheerio from "cheerio";
import { getPrisma } from "@/lib/prisma";
import { auditWebsiteHtml } from "@/lib/site-audit";
import { launchBrowser } from "@/lib/browser";
import { getLeadAiFields } from "@/lib/lead-ai-storage";
import { revalidatePath } from "next/cache";
import { sendLeadEmail } from "@/lib/email-actions";
import { detectBusinessCategory } from "@/lib/utils";


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

export async function enhanceDeveloperComments(rawComments: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const model = settings?.geminiModel?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `You are a professional senior web developer auditing a client website.
Rewrite the following raw, informal developer notes into a highly professional, persuasive, and technically accurate "Expert Audit Findings" paragraph or bullet points suitable for a client proposal.
Keep it concise, authoritative, and focused on business impact (e.g. lost conversions, SEO penalties).

Raw Notes:
${rawComments}

Response constraints: Return ONLY the rewritten text. No introductions, no greetings, no Markdown wrappers if it's just plain text.`;

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
