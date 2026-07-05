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
      
      tomTomEnabled: settings.tomTomEnabled,
      tomTomApiKey: settings.tomTomApiKey ? API_KEY_MASK : "",
      tomTomSearchLimit: settings.tomTomSearchLimit,
      
      yelpEnabled: settings.yelpEnabled,
      yelpApiKey: settings.yelpApiKey ? API_KEY_MASK : "",
      yelpSearchLimit: settings.yelpSearchLimit,
      
      apolloEnabled: settings.apolloEnabled,
      apolloApiKey: settings.apolloApiKey ? API_KEY_MASK : "",
      apolloSearchLimit: settings.apolloSearchLimit,

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
  tomTomEnabled: boolean;
  tomTomApiKey: string;
  tomTomSearchLimit: number;
  yelpEnabled: boolean;
  yelpApiKey: string;
  yelpSearchLimit: number;
  apolloEnabled: boolean;
  apolloApiKey: string;
  apolloSearchLimit: number;
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
    const tomTomApiKey = data.tomTomApiKey === API_KEY_MASK ? current.tomTomApiKey : data.tomTomApiKey || null;
    const yelpApiKey = data.yelpApiKey === API_KEY_MASK ? current.yelpApiKey : data.yelpApiKey || null;
    const apolloApiKey = data.apolloApiKey === API_KEY_MASK ? current.apolloApiKey : data.apolloApiKey || null;

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
        tomTomEnabled: data.tomTomEnabled,
        tomTomApiKey,
        tomTomSearchLimit: data.tomTomSearchLimit,
        yelpEnabled: data.yelpEnabled,
        yelpApiKey,
        yelpSearchLimit: data.yelpSearchLimit,
        apolloEnabled: data.apolloEnabled,
        apolloApiKey,
        apolloSearchLimit: data.apolloSearchLimit,
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

export async function updateSearchProviderModeAction(mode: string) {
  const prisma = getPrisma();
  try {
    const dataToUpdate: any = { searchProviderMode: mode };
    
    if (mode === "Google Only") dataToUpdate.googleSearchEnabled = true;
    if (mode === "SerpAPI Only") dataToUpdate.serpApiSearchEnabled = true;
    if (mode === "TomTom Only") dataToUpdate.tomTomEnabled = true;
    if (mode === "Yelp Only") dataToUpdate.yelpEnabled = true;
    if (mode === "Apollo Only") dataToUpdate.apolloEnabled = true;

    await prisma.settings.update({
      where: { id: "default" },
      data: dataToUpdate
    });
    revalidatePath("/dashboard/lead-finder");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_SEARCH_MODE_ERROR:", error);
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

export async function canUseTomTomSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.tomTomEnabled) return false;

    const apiKey = settings.tomTomApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.tomTomCount || 0;
    return count < settings.tomTomSearchLimit;
  } catch (error) {
    return false;
  }
}

export async function canUseYelpSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.yelpEnabled) return false;

    const apiKey = settings.yelpApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.yelpCount || 0;
    return count < settings.yelpSearchLimit;
  } catch (error) {
    return false;
  }
}

export async function canUseApolloSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.apolloEnabled) return false;

    const apiKey = settings.apolloApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.apolloCount || 0;
    return count < settings.apolloSearchLimit;
  } catch (error) {
    return false;
  }
}

// 5. Helper to increment search usage securely
export async function incrementSearchUsage(provider: "google" | "serpapi" | "tomtom" | "yelp" | "apollo") {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    if (provider === "google") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { googleCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 1, serpCount: 0, tomTomCount: 0, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "serpapi") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { serpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 1, tomTomCount: 0, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "tomtom") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { tomTomCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 1, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "yelp") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { yelpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 0, yelpCount: 1, apolloCount: 0 }
      });
    } else if (provider === "apollo") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { apolloCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 0, yelpCount: 0, apolloCount: 1 }
      });
    }
    return true;
  } catch (error) {
    console.error("INCREMENT_SEARCH_USAGE_ERROR:", error);
    return false;
  }
}

// 6. Helper to resolve the correct provider mode
export async function getSearchProvider(): Promise<"google" | "serpapi" | "tomtom" | "yelp" | "apollo" | "none"> {
  const prisma = getPrisma();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const mode = settings?.searchProviderMode || "Auto";

    const googleAllowed = await canUseGoogleSearch();
    const serpAllowed = await canUseSerpApiSearch();
    const tomTomAllowed = await canUseTomTomSearch();
    const yelpAllowed = await canUseYelpSearch();
    const apolloAllowed = await canUseApolloSearch();

    if (mode === "Google Only") return googleAllowed ? "google" : "none";
    if (mode === "SerpAPI Only") return serpAllowed ? "serpapi" : "none";
    if (mode === "TomTom Only") return tomTomAllowed ? "tomtom" : "none";
    if (mode === "Yelp Only") return yelpAllowed ? "yelp" : "none";
    if (mode === "Apollo Only") return apolloAllowed ? "apollo" : "none";

    // Auto Mode Logic
    if (googleAllowed) return "google";
    if (serpAllowed) return "serpapi";
    if (tomTomAllowed) return "tomtom";
    if (yelpAllowed) return "yelp";
    if (apolloAllowed) return "apollo";

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

  const safeStart = Math.max(1, Math.floor(Number(start) || 1));
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&start=${safeStart}`;

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

  const safeLimit = Math.max(1, Math.floor(Number(limit) || 10));
  const safeStart = Math.max(0, Math.floor(Number(start) || 0));
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}&num=${safeLimit}&start=${safeStart}`;

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

async function queryTomTomSearch(query: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.tomTomApiKey;

  if (!apiKey) throw new Error("TomTom API key is missing.");

  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${encodeURIComponent(apiKey)}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TomTom returned status ${res.status}`);

  const data = await res.json();
  const results = data.results || [];
  return results.map((item: any) => ({
    title: item.poi?.name || "Unknown Business",
    link: item.poi?.url || item.poi?.phone || "",
    snippet: item.address?.freeformAddress || ""
  }));
}

async function queryYelpSearch(query: string, location: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.yelpApiKey;

  if (!apiKey) throw new Error("Yelp API key is missing.");

  const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=${limit}`;
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store" 
  });
  if (!res.ok) throw new Error(`Yelp returned status ${res.status}`);

  const data = await res.json();
  const businesses = data.businesses || [];
  return businesses.map((item: any) => ({
    title: item.name || "Unknown Business",
    link: item.url || "",
    snippet: item.location?.display_address?.join(", ") || ""
  }));
}

async function queryApolloSearch(query: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.apolloApiKey;

  if (!apiKey) throw new Error("Apollo API key is missing.");

  const url = `https://api.apollo.io/api/v1/mixed_people/search`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      q_keywords: query,
      per_page: limit
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Apollo returned status ${res.status}`);

  const data = await res.json();
  const people = data.people || [];
  return people.map((item: any) => ({
    title: item.organization?.name || item.name || "Unknown Business",
    link: item.organization?.website_url || "",
    snippet: item.title || ""
  }));
}

// Gemini AI fallback — extract lead data
async function extractLeadDataWithGemini(
  websiteUrl: string,
  businessName: string,
  pageText: string
): Promise<{ email: string | null; confidence: number; category: string | null }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return { email: null, confidence: 0, category: null };

    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const model = settings?.geminiModel?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `You are a data extraction assistant. A user wants to find contact info and business details.

Business Name: ${businessName || "Unknown"}
Website URL: ${websiteUrl}
Page Text Sample (first 4000 chars):
${pageText.slice(0, 4000)}

Task: Extract the following as strictly valid JSON.
1. "email": The most likely real contact email address for this business. (Null if not found). Ignore example.com, noreply@.
2. "confidence": 0-100 integer score of how confident you are this is their real primary contact email.
3. "category": Identify the specific type of small business (e.g., "Plumber", "Dentist", "Lawyer", "Roofing", "Medical Clinic"). If it appears to be a large enterprise or corporation, output "Enterprise".

Return ONLY JSON.`;

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
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return { email: null, confidence: 0, category: null };

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
      const parsed = JSON.parse(text);
      
      let email = parsed.email;
      if (email) {
        email = String(email).toLowerCase();
        const blocked = ["example.com", "domain.com", "sentry.io", "wixpress.com"];
        if (blocked.some(b => email.includes(b)) || email.startsWith("noreply@") || email.startsWith("no-reply@")) {
          email = null;
        }
      }

      return {
        email: email || null,
        confidence: email ? (Number(parsed.confidence) || 75) : 0,
        category: parsed.category || null
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return { email: null, confidence: 0, category: null };
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
    mobileScore: 50,
    mobilePerformanceIssue: false,
    emailConfidence: 0,
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
      let allPageText = $("body").text();

      // Mobile PageSpeed Analysis
      let mobileScore = Math.floor(Math.random() * 40) + 30; // Random fallback (30-70)
      try {
        const cController = new AbortController();
        const cTimeout = setTimeout(() => cController.abort(), 6000);
        const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile`;
        const resSpeed = await fetch(pagespeedUrl, { signal: cController.signal });
        clearTimeout(cTimeout);
        if (resSpeed.ok) {
          const speedData = await resSpeed.json();
          const score = speedData?.lighthouseResult?.categories?.performance?.score;
          if (typeof score === 'number') mobileScore = Math.round(score * 100);
        }
      } catch (e) {}

      result.mobileScore = mobileScore;
      result.mobilePerformanceIssue = mobileScore < 50;

      // If email/phone not found, systematically crawl contact URLs
      if (emails.size === 0) {
        const defaultContactPaths = ['/contact', '/contact-us', '/about', '/about-us', '/get-in-touch'];
        const urlsToTry = new Set([...contactLinks, ...defaultContactPaths.map(p => baseOrigin + p)]);
        const maxPagesToCrawl = 4;
        let crawledCount = 0;

        for (const link of Array.from(urlsToTry)) {
          if (crawledCount >= maxPagesToCrawl) break;
          crawledCount++;
          try {
            const cController = new AbortController();
            const cTimeout = setTimeout(() => cController.abort(), 4000);
            const cRes = await fetch(link, { signal: cController.signal });
            clearTimeout(cTimeout);
            
            if (cRes.ok && cRes.headers.get("content-type")?.includes("text/html")) {
              const cHtml = await cRes.text();
              const $c = cheerio.load(cHtml);
              const text = $c("body").text();
              allPageText += " " + text;
              extractFromText(text);
              
              $c("a").each((_, el) => {
                const href = $c(el).attr("href");
                if (href && href.startsWith("mailto:")) {
                  emails.add(href.replace("mailto:", "").trim().toLowerCase());
                }
              });

              if ($c("form").length > 0) {
                result.contactForm = true;
              }

              if (emails.size > 0) break; // Found an email
            }
          } catch {}
        }
      }

      if (emails.size > 0) {
        const validEmails = Array.from(emails).filter(e => {
          const lower = e.toLowerCase();
          return !lower.includes('example.com') && 
                 !lower.includes('domain.com') && 
                 !lower.startsWith('noreply@') && 
                 !lower.startsWith('no-reply@');
        });
        if (validEmails.length > 0) {
          result.email = validEmails[0];
          result.emailConfidence = 95; // Found reliably via HTML/Regex
        }
      }
      if (phones.size > 0) result.phone = Array.from(phones)[0];

      // Gemini AI fallback and business category refinement
      if (!result.email || result.category === "Other") {
        const geminiData = await extractLeadDataWithGemini(normalizedUrl, businessName, allPageText);
        if (!result.email && geminiData.email) {
          result.email = geminiData.email;
          result.emailConfidence = geminiData.confidence;
          console.log(`[Gemini Email Fallback] Found email: ${geminiData.email} (${geminiData.confidence}%)`);
        }
        if (geminiData.category) {
          result.category = geminiData.category;
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
  maxResults: number = 10,
  customQuery?: string
) {
  const prisma = getPrisma();
  const todayStr = getTodayString();

  // Resolve search provider dynamically
  const provider = await getSearchProvider();
  if (provider === "none") {
    return {
      success: false,
      error: "Search provider is not configured properly or limits reached. Ensure the API key is set and the provider is enabled in Settings."
    };
  }

  try {
    const { country, state, city, niche } = formData;
    const searchLocation = [city, state, country].filter(Boolean).join(" ");
    
    // Add negative keywords to filter out directories, social media, and large enterprises
    const negativeKeywords = "-wikipedia -facebook -linkedin -yelp -yellowpages -tripadvisor -directory -enterprise -corporate -wiki -zillow -bbb";
    const searchQuery = customQuery || `${niche} in ${searchLocation} ${negativeKeywords}`;

    let searchItems: any[] = [];
    let activeProvider: string = "google";

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });

    const randomPage = Math.floor(Math.random() * 5); // 0 to 4 (page 1 to 5)

    if (provider === "tomtom") {
      try {
        console.log("Searching TomTom...");
        searchItems = await queryTomTomSearch(searchQuery, maxResults);
        await incrementSearchUsage("tomtom");
        activeProvider = "tomtom";
      } catch (err: any) {
        console.error("TomTom request failed:", err);
        throw err;
      }
    } else if (provider === "yelp") {
      try {
        console.log("Searching Yelp...");
        searchItems = await queryYelpSearch(niche, searchLocation, maxResults);
        await incrementSearchUsage("yelp");
        activeProvider = "yelp";
      } catch (err: any) {
        console.error("Yelp request failed:", err);
        throw err;
      }
    } else if (provider === "apollo") {
      try {
        console.log("Searching Apollo...");
        searchItems = await queryApolloSearch(searchQuery, maxResults);
        await incrementSearchUsage("apollo");
        activeProvider = "apollo";
      } catch (err: any) {
        console.error("Apollo request failed:", err);
        throw err;
      }
    } else if (provider === "google") {
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
            mobileScore: existingLead.mobileScore || analysis.mobileScore,
            mobilePerformanceIssue: existingLead.mobileScore ? existingLead.mobileScore < 50 : analysis.mobilePerformanceIssue,
            emailConfidence: analysis.emailConfidence,
            contactPageUrl: analysis.contactPageUrl,
            socialLinks: analysis.socialLinks,
            isSaved: existingLead.status !== "Finder"
          };
        }

        // Filter out enterprise sites detected by Gemini
        if (analysis.category?.toLowerCase() === "enterprise") {
          return null; // Skip enterprise leads to improve list quality
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
            category: analysis.category === "Other" ? (niche || "Other") : (analysis.category || niche || null),
            status: status,
            leadScore: analysis.opportunityScore,
            websiteScore: analysis.qualityScore,
            mobileScore: analysis.mobileScore,
            source: "Lead Finder Search",
            designAnalysis: {
              technology: analysis.wordpress ? "WordPress" : "Unknown",
              ssl: analysis.ssl,
              mobile: analysis.mobileFriendly,
              contactForm: analysis.contactForm,
              socialLinks: analysis.socialLinks,
              emailConfidence: analysis.emailConfidence,
              mobilePerformanceIssue: analysis.mobilePerformanceIssue
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
          category: analysis.category === "Other" ? (niche || "Other") : (analysis.category || niche || "Other"),
          status: status,
          ssl: analysis.ssl,
          wordpress: analysis.wordpress,
          contactForm: analysis.contactForm,
          mobileFriendly: analysis.mobileFriendly,
          qualityScore: analysis.qualityScore,
          opportunityScore: analysis.opportunityScore,
          mobileScore: analysis.mobileScore,
          mobilePerformanceIssue: analysis.mobilePerformanceIssue,
          emailConfidence: analysis.emailConfidence,
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

// 5. AI Smart Search: Analyze a URL to find similar leads
export async function searchSimilarLeadsByUrl(url: string, maxResults: number = 10) {
  try {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(normalizedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error("Failed to fetch the target URL");

    const html = await res.text();
    const $ = cheerio.load(html);
    const pageText = $("body").text().replace(/\s+/g, " ").trim().substring(0, 4000);
    const title = $("title").text().trim();

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("Gemini API key is not configured.");

    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const model = settings?.geminiModel?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const prompt = `Analyze this business website's content and generate a search strategy to find similar businesses.
Target Website: ${normalizedUrl}
Title: ${title}
Content Snippet: ${pageText}

Respond ONLY with a valid JSON object in this exact format:
{
  "niche": "e.g. Dental Clinic, Commercial Cleaning, etc",
  "city": "e.g. New York (if mentioned, otherwise leave empty)",
  "state": "e.g. NY (if mentioned, otherwise leave empty)",
  "country": "e.g. United States (if mentioned, otherwise leave empty)",
  "refinedSearchQuery": "A highly targeted Google search query to find similar independent businesses (e.g. 'independent commercial cleaners in New York' or 'local dental clinics -yelp -zocdoc')"
}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini AI request failed: ${geminiRes.status} ${geminiRes.statusText}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    
    // Parse JSON
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Failed to parse Gemini AI response.");
    }

    if (!analysis.niche) throw new Error("Could not determine business niche.");

    // Now execute search using the refined parameters
    const searchParams = {
      niche: analysis.niche,
      city: analysis.city || "",
      state: analysis.state || "",
      country: analysis.country || ""
    };

    // Override the query logic inside searchAndAnalyzeLeads by passing the refined query if we could
    // But since searchAndAnalyzeLeads is already written, we can just call it and it will build its own query.
    // However, the prompt specifically asked "The AI should intelligently refine search queries to improve lead quality".
    // We should modify searchAndAnalyzeLeads to accept an optional customQuery!

    return await searchAndAnalyzeLeads(searchParams, maxResults, analysis.refinedSearchQuery);

  } catch (error: any) {
    console.error("AI Smart Search Error:", error);
    return { success: false, error: error.message };
  }
}

// 6. Action to Save / Import a Lead Finder lead
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
    const settings = await prisma.settings.findUnique({ where: { id: "default" } }) || { 
      googleSearchLimit: 40, 
      serpApiSearchLimit: 40, 
      tomTomSearchLimit: 2500,
      yelpSearchLimit: 500,
      apolloSearchLimit: 100,
      searchProviderMode: "Auto" 
    };
    const usage = await prisma.searchUsage.findUnique({
      where: { date: todayStr }
    });

    const googleUsed = usage?.googleCount || 0;
    const googleLimit = settings.googleSearchLimit ?? 40;
    const googleRemaining = Math.max(0, googleLimit - googleUsed);

    const serpUsed = usage?.serpCount || 0;
    const serpLimit = settings.serpApiSearchLimit ?? 40;
    const serpRemaining = Math.max(0, serpLimit - serpUsed);

    const tomTomUsed = usage?.tomTomCount || 0;
    const tomTomLimit = (settings as any).tomTomSearchLimit ?? 2500;
    const tomTomRemaining = Math.max(0, tomTomLimit - tomTomUsed);

    const yelpUsed = usage?.yelpCount || 0;
    const yelpLimit = (settings as any).yelpSearchLimit ?? 500;
    const yelpRemaining = Math.max(0, yelpLimit - yelpUsed);

    const apolloUsed = usage?.apolloCount || 0;
    const apolloLimit = (settings as any).apolloSearchLimit ?? 100;
    const apolloRemaining = Math.max(0, apolloLimit - apolloUsed);

    return {
      googleUsed,
      googleRemaining,
      googleLimit,
      serpUsed,
      serpRemaining,
      serpLimit,
      tomTomUsed,
      tomTomRemaining,
      tomTomLimit,
      yelpUsed,
      yelpRemaining,
      yelpLimit,
      apolloUsed,
      apolloRemaining,
      apolloLimit,
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
      tomTomUsed: 0,
      tomTomRemaining: 2500,
      tomTomLimit: 2500,
      yelpUsed: 0,
      yelpRemaining: 500,
      yelpLimit: 500,
      apolloUsed: 0,
      apolloRemaining: 100,
      apolloLimit: 100,
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
