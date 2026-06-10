"use server";

import * as cheerio from "cheerio";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { chromium } from "playwright";

async function crawlDesignData(url: string) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const analysis = await page.evaluate(() => {
      const getStyles = (el: Element) => window.getComputedStyle(el);
      const colors = new Set<string>();
      const bgColors = new Set<string>();
      const allElements = Array.from(document.querySelectorAll("*"));
      allElements.slice(0, 500).forEach(el => {
        const styles = getStyles(el);
        if (styles.backgroundColor && styles.backgroundColor !== "rgba(0, 0, 0, 0)" && styles.backgroundColor !== "transparent") {
          bgColors.add(styles.backgroundColor);
        }
      });
      const fonts = new Set<string>();
      allElements.slice(0, 300).forEach(el => {
        const styles = getStyles(el);
        if (styles.fontFamily) fonts.add(styles.fontFamily.split(",")[0].replace(/['"]/g, ""));
      });
      const hasHero = !!document.querySelector("header + section, section:first-of-type, .hero, #hero");
      const hasNavbar = !!document.querySelector("nav, header, .nav, .navbar");
      const hasFooter = !!document.querySelector("footer, .footer, #footer");
      const ctaButtons = document.querySelectorAll("button, .btn, .button, a[class*='btn'], a[class*='button']").length;
      const h1Styles = document.querySelector("h1") ? getStyles(document.querySelector("h1")!) : null;

      return {
        colors: { background: Array.from(bgColors).slice(0, 5) },
        fonts: Array.from(fonts).slice(0, 5),
        structure: { hasHero, hasNavbar, hasFooter, ctaCount: ctaButtons },
        typography: { h1FontSize: h1Styles?.fontSize || "N/A", h1FontWeight: h1Styles?.fontWeight || "N/A" }
      };
    });
    return analysis;
  } catch (e) { return null; } finally { if (browser) await browser.close(); }
}

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
    
    // Run design crawl in parallel with basic extraction if possible, but keep it simple
    const designAnalysis = await crawlDesignData(targetUrl);

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

    const encodedUrl = encodeURIComponent(targetUrl);
    const runScore = async (strategy: "mobile" | "desktop") => {
      const apiKey = process.env.PAGESPEED_API_KEY;
      const urlWithKey = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}${apiKey ? `&key=${apiKey}` : ""}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
      
      try {
        const psRes = await fetch(urlWithKey, { next: { revalidate: 0 } });
        if (!psRes.ok) return null;
        return await psRes.json();
      } catch (e) {
        return null;
      }
    };

    const [mobileData, desktopData] = await Promise.all([
      runScore("mobile"),
      runScore("desktop")
    ]);

    const mCats = mobileData?.lighthouseResult?.categories || {};
    const dCats = desktopData?.lighthouseResult?.categories || {};
    
    const getScore = (cat: string) => {
      const m = mCats[cat]?.score;
      const d = dCats[cat]?.score;
      if (m !== undefined && d !== undefined) return Math.round(((m + d) / 2) * 100);
      if (m !== undefined) return Math.round(m * 100);
      if (d !== undefined) return Math.round(d * 100);
      return 0;
    };

    const perfScore = getScore("performance");
    const seoScore = getScore("seo");
    const accScore = getScore("accessibility");
    const bpScore = getScore("best-practices");
    
    const mScore = Math.round((mCats.performance?.score || 0) * 100);
    const dScore = Math.round((dCats.performance?.score || 0) * 100);
    
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
      topIssues: `Performance: ${perfScore}%\nSEO: ${seoScore}%\nAccessibility: ${accScore}%\nBest Practices: ${bpScore}%`
    };

    const lead = await prisma.lead.create({
      data: {
        businessName: extractedData.businessName,
        website: extractedData.website,
        email: extractedData.email,
        phone: extractedData.phone,
        address: extractedData.address,
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
        designAnalysis: designAnalysis as any,
        notes: `Contact Page: ${extractedData.contactPageUrl}\nSocials: ${extractedData.socialLinks}`
      }
    });

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
  try {
    const totalLeads = await prisma.lead.count();
    const hotLeads = await prisma.lead.count({ where: { status: "Hot Lead" } });
    const contactedLeads = await prisma.lead.count({ where: { status: "Contacted" } });
    const wonLeads = await prisma.lead.count({ where: { status: "Won" } });

    return {
      totalLeads,
      hotLeads,
      contactedLeads,
      wonLeads
    };
  } catch (error) {
    return {
      totalLeads: 0,
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

export async function getLeads(filters?: { search?: string; status?: string }) {
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
    }

    return await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("GET_LEADS_ERROR:", error);
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
    return await prisma.lead.findUnique({ where: { id: leadId } });
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
  const prisma = getPrisma();
  try {
    const settings = await getSettings();
    if (!settings?.resendApiKey) {
      throw new Error("Resend API key not found in settings.");
    }
    if (!settings?.senderEmail) {
      throw new Error("Sender email not found in settings.");
    }

    const resend = new Resend(settings.resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: `${settings.senderName || "Agency"} <${settings.senderEmail}>`,
      to: [toEmail],
      subject: subject,
      html: body.replace(/\n/g, "<br>"),
    });

    if (error) throw new Error(error.message);

    await prisma.emailLog.create({
      data: {
        leadId,
        toEmail,
        subject,
        body,
        status: "Sent"
      }
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "Contacted",
        lastContactedAt: new Date()
      }
    });

    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Email Error:", error);
    return { success: false, error: error.message };
  }
}
