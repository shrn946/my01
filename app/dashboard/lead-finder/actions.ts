"use server";

import * as cheerio from "cheerio";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { detectBusinessCategory } from "@/lib/utils";

const API_KEY_MASK = "●●●●●●●●●●●●●●●●";

// Format date in YYYY-MM-DD local format
function getTodayString() {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const localDate = new Date(Date.now() - tzOffset);
  return localDate.toISOString().split("T")[0];
}

// 1. Get Search Settings Action (with masked keys)
export async function getSearchSettings() {
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

    return {
      googleSearchEnabled: settings.googleSearchEnabled,
      googleApiKey: settings.googleApiKey ? API_KEY_MASK : "",
      googleSearchCx: settings.googleSearchCx ? API_KEY_MASK : "",
      googleSearchLimit: settings.googleSearchLimit,
      serpApiSearchEnabled: settings.serpApiSearchEnabled,
      serpApiKey: settings.serpApiKey ? API_KEY_MASK : "",
      serpApiSearchLimit: settings.serpApiSearchLimit,
      searchProviderMode: settings.searchProviderMode,
      
      // Target Locations & Categories
      locationsUsa: settings.locationsUsa || [],
      locationsUk: settings.locationsUk || [],
      locationsCanada: settings.locationsCanada || [],
      locationsGermany: settings.locationsGermany || [],
      locationsAustralia: settings.locationsAustralia || [],
      locationsNewZealand: settings.locationsNewZealand || [],
      locationsPriority: settings.locationsPriority || [],
      categories: settings.categories || []
    };
  } catch (error) {
    console.error("GET_SEARCH_SETTINGS_ERROR:", error);
    return null;
  }
}

// 2. Update Search Settings Action (ignoring masked inputs)
export async function updateSearchSettings(data: {
  googleSearchEnabled: boolean;
  googleApiKey: string;
  googleSearchCx: string;
  googleSearchLimit: number;
  serpApiSearchEnabled: boolean;
  serpApiKey: string;
  serpApiSearchLimit: number;
  searchProviderMode: string;
  locationsUsa?: string[];
  locationsUk?: string[];
  locationsCanada?: string[];
  locationsGermany?: string[];
  locationsAustralia?: string[];
  locationsNewZealand?: string[];
  locationsPriority?: string[];
  categories?: string[];
}) {
  const prisma = getPrisma();
  try {
    const current = await prisma.settings.findUnique({
      where: { id: "default" }
    }) || await prisma.settings.create({
      data: { id: "default" }
    });

    const googleApiKey = data.googleApiKey === API_KEY_MASK ? current.googleApiKey : data.googleApiKey || null;
    const googleSearchCx = data.googleSearchCx === API_KEY_MASK ? current.googleSearchCx : data.googleSearchCx || null;
    const serpApiKey = data.serpApiKey === API_KEY_MASK ? current.serpApiKey : data.serpApiKey || null;

    await prisma.settings.update({
      where: { id: "default" },
      data: {
        googleSearchEnabled: data.googleSearchEnabled,
        googleApiKey,
        googleSearchCx,
        googleSearchLimit: data.googleSearchLimit,
        serpApiSearchEnabled: data.serpApiSearchEnabled,
        serpApiKey,
        serpApiSearchLimit: data.serpApiSearchLimit,
        searchProviderMode: data.searchProviderMode,
        locationsUsa: data.locationsUsa,
        locationsUk: data.locationsUk,
        locationsCanada: data.locationsCanada,
        locationsGermany: data.locationsGermany,
        locationsAustralia: data.locationsAustralia,
        locationsNewZealand: data.locationsNewZealand,
        locationsPriority: data.locationsPriority,
        categories: data.categories
      }
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/lead-finder");

    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_SEARCH_SETTINGS_ERROR:", error);
    return { success: false, error: error.message };
  }
}

// 3. Helper to check if Google Custom Search can be used
export async function canUseGoogleSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.googleSearchEnabled) return false;

    const apiKey = settings.googleApiKey || process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
    const cx = settings.googleSearchCx || process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CX || process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cx) return false;

    const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.googleCount || 0;
    return count < settings.googleSearchLimit;
  } catch (error) {
    return false;
  }
}

// 4. Helper to check if SerpAPI can be used
export async function canUseSerpApiSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.serpApiSearchEnabled) return false;

    const apiKey = settings.serpApiKey || process.env.SERP_API_KEY;
    if (!apiKey) return false;

    const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.serpCount || 0;
    return count < settings.serpApiSearchLimit;
  } catch (error) {
    return false;
  }
}

// 5. Helper to increment search usage securely
export async function incrementSearchUsage(provider: "google" | "serpapi") {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    if (provider === "google") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { googleCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 1, serpCount: 0 }
      });
    } else if (provider === "serpapi") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { serpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 1 }
      });
    }
    return true;
  } catch (error) {
    console.error("INCREMENT_SEARCH_USAGE_ERROR:", error);
    return false;
  }
}

// 6. Helper to resolve the correct provider mode
export async function getSearchProvider(): Promise<"google" | "serpapi" | "none"> {
  const prisma = getPrisma();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const mode = settings?.searchProviderMode || "Auto";

    const googleAllowed = await canUseGoogleSearch();
    const serpAllowed = await canUseSerpApiSearch();

    if (mode === "Google Only") {
      return googleAllowed ? "google" : "none";
    }
    if (mode === "SerpAPI Only") {
      return serpAllowed ? "serpapi" : "none";
    }

    // Auto Mode Logic (Google -> SerpAPI Fallback)
    if (googleAllowed) return "google";
    if (serpAllowed) return "serpapi";

    return "none";
  } catch (error) {
    return "none";
  }
}

// Fetch search results from Google Custom Search
async function queryGoogleCustomSearch(query: string, start: number = 1) {
  const prisma = getPrisma();
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.googleApiKey || process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
  const cx = settings?.googleSearchCx || process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CX || process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    throw new Error(
      "Google Custom Search API configuration is missing. Please configure it in settings or environment."
    );
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&start=${start}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson?.error?.message || `Google Search API returned status ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  return data.items || [];
}

// Fetch search results from SerpAPI
async function querySerpApiSearch(query: string, limit: number = 10, start: number = 0) {
  const prisma = getPrisma();
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.serpApiKey || process.env.SERP_API_KEY;

  if (!apiKey) {
    throw new Error("SerpAPI API key is missing. Please configure it in Settings.");
  }

  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}&num=${limit}&start=${start}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson?.error || `SerpAPI returned status ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  const organicResults = data.organic_results || [];
  return organicResults.map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));
}

// Gemini AI email finder fallback — used when scraping returns no email
async function findEmailWithGemini(
  websiteUrl: string,
  businessName: string,
  pageText: string
): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;

    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `You are a data extraction assistant. A user wants to find the contact email address for a business.

Business Name: ${businessName || "Unknown"}
Website URL: ${websiteUrl}
Page Text Sample (first 3000 chars):
${pageText.slice(0, 3000)}

Task: Based on the page text and business information above, identify the most likely real contact email address for this business. 

Rules:
- Return ONLY the email address as a plain string — no JSON, no explanation, no extra text
- If no real email is found in the text, respond with: NOT_FOUND
- Do NOT invent or guess emails — only return an email if it appears in the page text above
- Ignore: image filenames, placeholder emails like example@example.com, noreply@, no-reply@, wordpress@, admin@ system emails
- Prefer: info@, contact@, hello@, support@, sales@, team@, or any person's email matching the domain`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 100,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return null;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!text || text === "NOT_FOUND") return null;

      // Validate it looks like a real email
      const emailMatch = text.match(/[a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}/);
      if (!emailMatch) return null;

      const email = emailMatch[0].toLowerCase();

      // Filter out known false positives
      const blocked = ["example.com", "domain.com", "yourdomain.com", "sentry.io", "wixpress.com"];
      if (blocked.some(b => email.includes(b))) return null;
      if (email.startsWith("noreply@") || email.startsWith("no-reply@") || email.startsWith("wordpress@")) return null;

      return email;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

// Lightweight website analysis
async function analyzeWebsite(url: string, businessName: string = "") {
  const result = {
    ssl: url.startsWith("https://"),
    wordpress: false,
    contactForm: false,
    mobileFriendly: true,
    qualityScore: 50,
    opportunityScore: 50,
    email: null as string | null,
    phone: null as string | null,
    contactPageUrl: null as string | null,
    category: "Other",
    socialLinks: {
      facebook: null as string | null,
      instagram: null as string | null,
      linkedin: null as string | null,
      twitter: null as string | null,
      youtube: null as string | null,
      tiktok: null as string | null,
    }
  };

  try {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsedUrl = new URL(normalizedUrl);
    const baseOrigin = parsedUrl.origin;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout limit

    const res = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal,
      next: { revalidate: 0 }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // SSL Detection
      result.ssl = normalizedUrl.startsWith("https://");

      // WordPress Detection
      const htmlContent = html.toLowerCase();
      if (
        htmlContent.includes("wp-content") ||
        htmlContent.includes("wp-includes") ||
        $('meta[name="generator"]').attr("content")?.toLowerCase().includes("wordpress")
      ) {
        result.wordpress = true;
      }

      // Viewport tag (Mobile friendliness)
      const viewport = $('meta[name="viewport"]').attr("content");
      result.mobileFriendly = !!viewport;

      // Contact Form on Home page
      result.contactForm = $("form").length > 0;

      // Extract Emails & Phones
      const emails = new Set<string>();
      const phones = new Set<string>();
      const contactLinks: string[] = [];

      const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi;
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

      const extractFromText = (text: string) => {
        const e = text.match(emailRegex);
        if (e) e.forEach(m => emails.add(m.toLowerCase()));
        const p = text.match(phoneRegex);
        if (p) p.forEach(m => phones.add(m));
      };

      extractFromText($("body").text());

      // Search links
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        if (href.startsWith("mailto:")) emails.add(href.replace("mailto:", "").trim().toLowerCase());
        if (href.startsWith("tel:")) phones.add(href.replace("tel:", "").trim());

        const lower = href.toLowerCase();
        if (lower.includes("contact") || lower.includes("about") || lower.includes("support")) {
          if (href.startsWith("http") && href.includes(parsedUrl.hostname)) {
            contactLinks.push(href);
          } else if (href.startsWith("/")) {
            contactLinks.push(baseOrigin + href);
          }
        }

        // Social media detection
        if (lower.includes("facebook.com/") && !lower.includes("sharer") && !result.socialLinks.facebook) {
          result.socialLinks.facebook = href.startsWith("http") ? href : null;
        }
        if (lower.includes("instagram.com/") && !result.socialLinks.instagram) {
          result.socialLinks.instagram = href.startsWith("http") ? href : null;
        }
        if (lower.includes("linkedin.com/") && !result.socialLinks.linkedin) {
          result.socialLinks.linkedin = href.startsWith("http") ? href : null;
        }
        if ((lower.includes("twitter.com/") || lower.includes("x.com/")) && !lower.includes("intent") && !result.socialLinks.twitter) {
          result.socialLinks.twitter = href.startsWith("http") ? href : null;
        }
        if (lower.includes("youtube.com/") && !lower.includes("watch") && !result.socialLinks.youtube) {
          result.socialLinks.youtube = href.startsWith("http") ? href : null;
        }
        if (lower.includes("tiktok.com/") && !result.socialLinks.tiktok) {
          result.socialLinks.tiktok = href.startsWith("http") ? href : null;
        }
      });

      if (contactLinks.length > 0) {
        result.contactPageUrl = contactLinks[0];
      }

      const title = $("title").text().trim();
      const metaDescription = $("meta[name='description']").attr("content") || "";

      // If email/phone not found, crawl primary contact page
      if (emails.size === 0 && contactLinks.length > 0) {
        try {
          const cController = new AbortController();
          const cTimeout = setTimeout(() => cController.abort(), 4000);
          const cRes = await fetch(contactLinks[0], { signal: cController.signal });
          clearTimeout(cTimeout);
          if (cRes.ok) {
            const cHtml = await cRes.text();
            const $c = cheerio.load(cHtml);
            extractFromText($c("body").text());
            if ($c("form").length > 0) {
              result.contactForm = true;
            }
          }
        } catch {}
      }

      if (emails.size > 0) result.email = Array.from(emails)[0];
      if (phones.size > 0) result.phone = Array.from(phones)[0];

      // Gemini AI fallback — if no email found via scraping, ask Gemini to extract from page text
      if (!result.email) {
        const pageBodyText = $("body").text();
        const geminiEmail = await findEmailWithGemini(normalizedUrl, businessName, pageBodyText);
        if (geminiEmail) {
          result.email = geminiEmail;
          console.log(`[Gemini Email Fallback] Found email for ${normalizedUrl}: ${geminiEmail}`);
        }
      }

      // Computations (out of 100)
      let score = 0;
      if (result.ssl) score += 25;
      if (result.mobileFriendly) score += 25;
      if (result.wordpress) score += 25;
      if (result.contactForm) score += 25;
      result.qualityScore = score;
      result.opportunityScore = 100 - score;

      // Detect category
      result.category = detectBusinessCategory(businessName, title, metaDescription, normalizedUrl, html);
    }
  } catch (error) {
    console.warn(`Scraping timed out or failed for ${url}:`, error);
  }

  if (result.category === "Other" && businessName) {
    result.category = detectBusinessCategory(businessName, "", "", url, "");
  }

  return result;
}

// 4. Main Server Action to Search and Analyze Leads (with Fallback Logic & Custom Limit Size)
export async function searchAndAnalyzeLeads(
  formData: {
    country: string;
    state: string;
    city: string;
    niche: string;
  },
  maxResults: number = 10
) {
  const prisma = getPrisma();
  const todayStr = getTodayString();

  // Resolve search provider dynamically
  const provider = await getSearchProvider();
  if (provider === "none") {
    return {
      success: false,
      error: "Search limit reached for all enabled search engines. Please adjust settings or try again tomorrow."
    };
  }

  try {
    const { country, state, city, niche } = formData;
    const searchLocation = [city, state, country].filter(Boolean).join(" ");
    const searchQuery = `${niche} in ${searchLocation}`;

    let searchItems: any[] = [];
    let activeProvider: "google" | "serpapi" = "google";

    const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });

    const randomPage = Math.floor(Math.random() * 5); // 0 to 4 (page 1 to 5)

    if (provider === "google") {
      try {
        console.log("Searching Google Custom Search API...");
        
        // Calculate requests needed for Google (max 10 results per query)
        let requestsNeeded = maxResults <= 5 ? 1 : maxResults <= 10 ? 1 : 2;
        const googleUsed = usage?.googleCount || 0;
        const googleLimit = settings?.googleSearchLimit ?? 40;
        const googleRemaining = Math.max(0, googleLimit - googleUsed);

        if (googleRemaining < requestsNeeded) {
          requestsNeeded = googleRemaining;
        }

        if (requestsNeeded <= 0) {
          throw new Error("Google limit exceeded. Triggering fallback.");
        }

        const randomStartOffset = randomPage * 10;
        for (let r = 0; r < requestsNeeded; r++) {
          const start = r * 10 + 1 + randomStartOffset;
          const items = await queryGoogleCustomSearch(searchQuery, start);
          searchItems.push(...items);
          await incrementSearchUsage("google");
          if (items.length < 10) break; // End of pagination
        }

        activeProvider = "google";
      } catch (err: any) {
        console.error("Google Custom Search API request failed:", err);
        // Fallback to SerpAPI if mode is Auto and SerpAPI is allowed
        if (settings?.searchProviderMode === "Auto" && (await canUseSerpApiSearch())) {
          console.log("Falling back to SerpAPI search...");
          const randomStartOffset = randomPage * maxResults;
          searchItems = await querySerpApiSearch(searchQuery, maxResults, randomStartOffset);
          await incrementSearchUsage("serpapi");
          activeProvider = "serpapi";
        } else {
          throw err;
        }
      }
    } else {
      try {
        console.log("Searching SerpAPI...");
        
        // SerpAPI queries return the requested results (up to 20 or more) in a single request
        const serpUsed = usage?.serpCount || 0;
        const serpLimit = settings?.serpApiSearchLimit ?? 40;
        const serpRemaining = Math.max(0, serpLimit - serpUsed);

        if (serpRemaining <= 0) {
          throw new Error("SerpAPI limit exceeded. Triggering fallback.");
        }

        const randomStartOffset = randomPage * maxResults;
        searchItems = await querySerpApiSearch(searchQuery, maxResults, randomStartOffset);
        await incrementSearchUsage("serpapi");
        activeProvider = "serpapi";
      } catch (err: any) {
        console.error("SerpAPI request failed:", err);
        // Fallback to Google if mode is Auto and Google is allowed
        if (settings?.searchProviderMode === "Auto" && (await canUseGoogleSearch())) {
          console.log("Falling back to Google Custom Search API...");
          
          let requestsNeeded = maxResults <= 5 ? 1 : maxResults <= 10 ? 1 : 2;
          const googleUsed = usage?.googleCount || 0;
          const googleLimit = settings?.googleSearchLimit ?? 40;
          const googleRemaining = Math.max(0, googleLimit - googleUsed);

          if (googleRemaining < requestsNeeded) {
            requestsNeeded = googleRemaining;
          }

          if (requestsNeeded > 0) {
            const randomStartOffset = randomPage * 10;
            for (let r = 0; r < requestsNeeded; r++) {
              const start = r * 10 + 1 + randomStartOffset;
              const items = await queryGoogleCustomSearch(searchQuery, start);
              searchItems.push(...items);
              await incrementSearchUsage("google");
              if (items.length < 10) break;
            }
            activeProvider = "google";
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    // Limit returned list to maxResults
    searchItems = searchItems.slice(0, maxResults);

    const analyzedLeads: any[] = [];

    // Analyze results in batches of 3 to avoid timeouts
    for (let i = 0; i < searchItems.length; i += 3) {
      const batch = searchItems.slice(i, i + 3);
      const batchPromises = batch.map(async (item: any) => {
        const websiteUrl = item.link;
        if (!websiteUrl) return null;

        // Perform analysis
        const analysis = await analyzeWebsite(websiteUrl, item.title);

        // Check if lead already exists by website URL or email
        let existingLead = await prisma.lead.findFirst({
          where: {
            OR: [
              { website: websiteUrl },
              { email: analysis.email ? { equals: analysis.email, mode: "insensitive" } : undefined }
            ].filter(Boolean) as any
          }
        });

        const status = "New";

        if (existingLead) {
          existingLead = await prisma.lead.update({
            where: { id: existingLead.id },
            data: {
              email: existingLead.email || analysis.email,
              phone: existingLead.phone || analysis.phone,
              category: existingLead.category || analysis.category || niche,
              status: "New"
            }
          });

          return {
            id: existingLead.id,
            businessName: existingLead.businessName || item.title,
            website: existingLead.website,
            email: existingLead.email || analysis.email,
            phone: existingLead.phone || analysis.phone,
            city: existingLead.city || city,
            country: existingLead.address || country,
            category: existingLead.category || analysis.category || niche,
            status: existingLead.status,
            ssl: existingLead.website.startsWith("https://"),
            wordpress: existingLead.designAnalysis ? (existingLead.designAnalysis as any).technology === "WordPress" : analysis.wordpress,
            contactForm: analysis.contactForm,
            mobileFriendly: analysis.mobileFriendly,
            qualityScore: existingLead.websiteScore || analysis.qualityScore,
            opportunityScore: existingLead.leadScore || analysis.opportunityScore,
            contactPageUrl: analysis.contactPageUrl,
            socialLinks: analysis.socialLinks,
            isSaved: existingLead.status !== "Finder"
          };
        }

        // Store result in DB
        const newLead = await prisma.lead.create({
          data: {
            businessName: item.title,
            website: websiteUrl,
            email: analysis.email,
            phone: analysis.phone,
            city: city || null,
            address: country || null,
            category: analysis.category || niche || null,
            status: status,
            leadScore: analysis.opportunityScore,
            websiteScore: analysis.qualityScore,
            source: "Lead Finder Search",
            designAnalysis: {
              technology: analysis.wordpress ? "WordPress" : "Unknown",
              ssl: analysis.ssl,
              mobile: analysis.mobileFriendly,
              contactForm: analysis.contactForm,
              socialLinks: analysis.socialLinks
            } as any
          }
        });

        return {
          id: newLead.id,
          businessName: item.title,
          website: websiteUrl,
          email: analysis.email,
          phone: analysis.phone,
          city: city,
          country: country,
          category: analysis.category || niche,
          status: status,
          ssl: analysis.ssl,
          wordpress: analysis.wordpress,
          contactForm: analysis.contactForm,
          mobileFriendly: analysis.mobileFriendly,
          qualityScore: analysis.qualityScore,
          opportunityScore: analysis.opportunityScore,
          contactPageUrl: analysis.contactPageUrl,
          socialLinks: analysis.socialLinks,
          isSaved: true
        };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(res => {
        if (res) analyzedLeads.push(res);
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/lead-finder");

    // Fetch updated stats to return to front
    const updatedStats = await getSearchLimitStats();

    return {
      success: true,
      data: analyzedLeads,
      provider: activeProvider,
      stats: updatedStats
    };
  } catch (error: any) {
    console.error("SEARCH_AND_ANALYZE_ERROR:", error);
    return {
      success: false,
      error: error.message || "An error occurred while performing search."
    };
  }
}

// 5. Action to Save / Import a Lead Finder lead
export async function saveLeadFromFinder(leadId: string) {
  const prisma = getPrisma();
  try {
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: "New" }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/lead-finder");
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Action to Add a lead to Campaign (changes status to Hot Lead)
export async function addLeadToCampaign(leadId: string) {
  const prisma = getPrisma();
  try {
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: "Hot Lead" }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/lead-finder");
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. Action to Mark a lead as Contacted
export async function markLeadAsContacted(leadId: string) {
  const prisma = getPrisma();
  try {
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: "Contacted", lastContactedAt: new Date() }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/lead-finder");
    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 8. Action to get current search usage limit stats directly
export async function getSearchLimitStats() {
  const prisma = getPrisma();
  const todayStr = getTodayString();

  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } }) || { googleSearchLimit: 40, serpApiSearchLimit: 40, searchProviderMode: "Auto" };
    const usage = await prisma.searchUsage.findUnique({
      where: { date: todayStr }
    });

    const googleUsed = usage?.googleCount || 0;
    const googleLimit = settings.googleSearchLimit ?? 40;
    const googleRemaining = Math.max(0, googleLimit - googleUsed);

    const serpUsed = usage?.serpCount || 0;
    const serpLimit = settings.serpApiSearchLimit ?? 40;
    const serpRemaining = Math.max(0, serpLimit - serpUsed);

    return {
      googleUsed,
      googleRemaining,
      googleLimit,
      serpUsed,
      serpRemaining,
      serpLimit,
      searchProviderMode: settings.searchProviderMode || "Auto"
    };
  } catch (error) {
    return {
      googleUsed: 0,
      googleRemaining: 40,
      googleLimit: 40,
      serpUsed: 0,
      serpRemaining: 40,
      serpLimit: 40,
      searchProviderMode: "Auto"
    };
  }
}

// 9. Action to get all leads for the Lead Finder view (ordered by newest first)
export async function getFinderLeads() {
  const prisma = getPrisma();
  try {
    const data = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" }
    });
    return data.map(lead => ({
      id: lead.id,
      businessName: lead.businessName,
      website: lead.website,
      email: lead.email || "",
      phone: lead.phone || "",
      city: lead.city || "",
      country: lead.address || "",
      category: lead.category || "",
      status: lead.status,
      ssl: lead.website.startsWith("https://"),
      wordpress: lead.designAnalysis ? (lead.designAnalysis as any).technology === "WordPress" : false,
      contactForm: lead.designAnalysis ? (lead.designAnalysis as any).contactForm : false,
      mobileFriendly: lead.designAnalysis ? (lead.designAnalysis as any).mobile : false,
      qualityScore: lead.websiteScore || 0,
      opportunityScore: lead.leadScore || 0,
      socialLinks: (lead.designAnalysis as any)?.socialLinks || null,
      isSaved: lead.status !== "Finder"
    }));
  } catch (error) {
    console.error("GET_FINDER_LEADS_ERROR:", error);
    return [];
  }
}

// 10. Action to Import Leads from Excel Data
export async function importLeadsAction(leadsData: any[]) {
  const prisma = getPrisma();
  try {
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const row of leadsData) {
      let website = row["Website URL"] || row["website"] || "";
      if (!website) {
        skippedCount++;
        continue;
      }

      // Clean & normalize URL
      website = website.trim();
      if (!website.startsWith("http://") && !website.startsWith("https://")) {
        website = "https://" + website;
      }

      // Check for duplicate in DB
      const existing = await prisma.lead.findFirst({
        where: { website }
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      const businessName = row["Business Name"] || row["businessName"] || "Unknown Business";
      const email = row["Email"] || row["email"] || null;
      const phone = row["Phone"] || row["phone"] || null;
      const city = row["City"] || row["city"] || null;
      const country = row["Country"] || row["country"] || null;
      const category = row["Category/Niche"] || row["category"] || null;
      
      let status = row["Status"] || row["status"] || "New";

      let detectedCategory = category;
      if (!detectedCategory || detectedCategory.toLowerCase() === "other" || detectedCategory.toLowerCase() === "general") {
        detectedCategory = detectBusinessCategory(businessName, "", "", website, "");
      }

      // Heuristics or imported values
      const ssl = website.startsWith("https://");
      const wordpress = row["WordPress Setup"] === "Yes" || row["wordpress"] === true || row["wordpress"] === "Yes";
      const contactForm = row["Contact Form"] === "Yes" || row["contactForm"] === true || row["contactForm"] === "Yes";
      const mobileFriendly = row["Mobile Friendly"] === "Yes" || row["mobileFriendly"] === true || row["mobileFriendly"] === "Yes";

      const qualityScore = parseInt(row["Quality Score"]) || 50;
      const opportunityScore = parseInt(row["Opportunity Score"]) || 50;

      await prisma.lead.create({
        data: {
          businessName,
          website,
          email,
          phone,
          city,
          address: country, // we use address field for Country
          category: detectedCategory,
          status,
          leadScore: opportunityScore,
          websiteScore: qualityScore,
          source: "Excel Import",
          designAnalysis: {
            technology: wordpress ? "WordPress" : "Unknown",
            ssl,
            mobile: mobileFriendly,
            contactForm
          } as any
        }
      });

      importedCount++;
    }

    revalidatePath("/dashboard/lead-finder");
    revalidatePath("/dashboard");
    return { success: true, importedCount, skippedCount };
  } catch (error: any) {
    console.error("IMPORT_LEADS_ERROR:", error);
    return { success: false, error: error.message };
  }
}
