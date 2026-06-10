"use server";

import * as cheerio from "cheerio";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function extractWebsiteInfo(url: string, data: { businessName: string, source: string, category: string, city: string, notes: string }) {
  try {
    const normalizeUrl = (u: string) => {
      if (!u.startsWith("http://") && !u.startsWith("https://")) {
        return "https://" + u;
      }
      return u;
    };
    
    const targetUrl = normalizeUrl(url);
    const parsedUrl = new URL(targetUrl);
    const baseOrigin = parsedUrl.origin;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error("Failed to fetch website");
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").text().trim();
    const metaDescription = $("meta[name='description']").attr("content") || "";

    const emails = new Set<string>();
    const phones = new Set<string>();
    let contactFormExists = $("form").length > 0;
    const socialLinks = new Set<string>();
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    const extractFromText = (text: string) => {
      const e = text.match(emailRegex);
      if (e) e.forEach(m => emails.add(m));
      const p = text.match(phoneRegex);
      if (p) p.forEach(m => phones.add(m));
    };

    extractFromText($("body").text());

    const contactLinks: string[] = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (href.startsWith("mailto:")) emails.add(href.replace("mailto:", "").trim());
      if (href.startsWith("tel:")) phones.add(href.replace("tel:", "").trim());
      
      const lower = href.toLowerCase();
      if (lower.includes("facebook.com") || lower.includes("twitter.com") || lower.includes("linkedin.com") || lower.includes("instagram.com")) {
        socialLinks.add(href);
      }

      if (lower.includes("contact") || lower.includes("about") || lower.includes("team")) {
        if (href.startsWith("http") && href.includes(parsedUrl.hostname)) {
          contactLinks.push(href);
        } else if (href.startsWith("/")) {
          contactLinks.push(baseOrigin + href);
        }
      }
    });

    const uniqueContact = Array.from(new Set(contactLinks)).slice(0, 2);
    for (const link of uniqueContact) {
      try {
        const cRes = await fetch(link, { next: { revalidate: 0 } });
        const cHtml = await cRes.text();
        const $c = cheerio.load(cHtml);
        extractFromText($c("body").text());
        if ($c("form").length > 0) contactFormExists = true;
      } catch (e) {
        // ignore
      }
    }

    const lead = await prisma.lead.create({
      data: {
        businessName: data.businessName,
        website: targetUrl,
        source: data.source,
        category: data.category,
        city: data.city,
        notes: data.notes,
        email: Array.from(emails).join(", "),
        phone: Array.from(phones).join(", "),
        topIssues: `Title: ${title}\nMeta: ${metaDescription}\nHas Contact Form: ${contactFormExists}\nSocials: ${Array.from(socialLinks).join(", ")}`,
        status: "Extracted",
      }
    });

    revalidatePath("/admin/leads");
    return { success: true, leadId: lead.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLead(id: string, data: any) {
  try {
    const lead = await prisma.lead.update({
      where: { id },
      data
    });
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath(`/admin/audit?id=${id}`);
    return { success: true, lead };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function crawlDesignData(url: string) {
  if (process.env.VERCEL) {
    console.log("Crawl skipped: Chromium is not supported on Vercel serverless functions.");
    return null;
  }

  let browser;
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const analysis = await page.evaluate(() => {
      const getStyles = (el: Element) => window.getComputedStyle(el);
      
      // 1. Color Extraction
      const colors = new Set<string>();
      const bgColors = new Set<string>();
      const textColors = new Set<string>();
      
      const allElements = Array.from(document.querySelectorAll("*"));
      allElements.slice(0, 1000).forEach(el => {
        const styles = getStyles(el);
        if (styles.color) textColors.add(styles.color);
        if (styles.backgroundColor && styles.backgroundColor !== "rgba(0, 0, 0, 0)" && styles.backgroundColor !== "transparent") {
          bgColors.add(styles.backgroundColor);
        }
      });

      // 2. Font Extraction
      const fonts = new Set<string>();
      allElements.slice(0, 500).forEach(el => {
        const styles = getStyles(el);
        if (styles.fontFamily) fonts.add(styles.fontFamily.split(",")[0].replace(/['"]/g, ""));
      });

      // 3. Layout Check
      const hasGrid = allElements.some(el => getStyles(el).display === "grid");
      const hasFlex = allElements.some(el => getStyles(el).display === "flex");
      
      // 4. Structural Audit
      const hasHero = !!document.querySelector("header + section, section:first-of-type, .hero, #hero");
      const hasNavbar = !!document.querySelector("nav, header, .nav, .navbar");
      const hasFooter = !!document.querySelector("footer, .footer, #footer");
      const ctaButtons = document.querySelectorAll("button, .btn, .button, a[class*='btn'], a[class*='button']").length;

      // 5. Visual Hierarchy
      const h1Styles = document.querySelector("h1") ? getStyles(document.querySelector("h1")!) : null;

      return {
        colors: {
          text: Array.from(textColors).slice(0, 5),
          background: Array.from(bgColors).slice(0, 5)
        },
        fonts: Array.from(fonts).slice(0, 5),
        structure: {
          hasHero,
          hasNavbar,
          hasFooter,
          ctaCount: ctaButtons,
          hasGrid,
          hasFlex
        },
        typography: {
          h1FontSize: h1Styles?.fontSize || "N/A",
          h1FontWeight: h1Styles?.fontWeight || "N/A"
        }
      };
    });

    return analysis;
  } catch (error) {
    console.error("Design Crawl Error:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

export async function analyzeWebsite(leadId: string) {
  try {
    console.log(`Starting PageSpeed analysis for lead: ${leadId}`);
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    // 1. Run Design Crawl (Playwright)
    const designAnalysis = await crawlDesignData(lead.website);

    // 2. Fetch HTML and Parse (Cheerio)
    const htmlRes = await fetch(lead.website, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 }
    });
    const html = await htmlRes.text();
    const $ = cheerio.load(html);

    // 3. Extract Basic Stats
    const headings = {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
    };
    const images = $("img").length;
    const imagesWithoutAlt = $("img:not([alt])").length;
    const links = $("a").length;
    const ctas = $("button, a.btn, a.button, [class*='button'], [class*='btn']").length;

    // 4. PageSpeed API Scores
    const urlEncoded = encodeURIComponent(lead.website);
    const runScore = async (strategy: "mobile" | "desktop") => {
      const apiKey = process.env.PAGESPEED_API_KEY;
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${urlEncoded}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ""}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); 
        const res = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    };

    const [mobileData, desktopData] = await Promise.all([
      runScore("mobile"),
      runScore("desktop")
    ]);

    const perfScore = Math.round((mobileData?.lighthouseResult?.categories?.performance?.score || 0) * 100) || 50;
    const seoScore = Math.round((mobileData?.lighthouseResult?.categories?.seo?.score || 0) * 100) || 60;
    const mobilePerf = Math.round((mobileData?.lighthouseResult?.categories?.performance?.score || 0) * 100) || 50;
    const desktopPerf = Math.round((desktopData?.lighthouseResult?.categories?.performance?.score || 0) * 100) || 70;

    // 5. Heuristic Scores
    let designScore = 70;
    if (headings.h1 === 0) designScore -= 10;
    if (images < 3) designScore -= 10;
    if (perfScore < 50) designScore -= 10;
    if (designAnalysis && !designAnalysis.structure.hasHero) designScore -= 10;

    let conversionScore = 60;
    if (ctas < 2) conversionScore -= 20;
    if ($("form").length === 0) conversionScore -= 20;
    conversionScore = Math.min(100, Math.max(0, conversionScore));

    // 6. Proposals
    const proposals = [];
    if (headings.h1 === 0) proposals.push("Add a clear H1 heading to the hero section");
    if (ctas < 2) proposals.push("Add more prominent Call-to-Action (CTA) buttons");
    if ($("form").length === 0) proposals.push("Add a contact form to capture leads directly");
    if (imagesWithoutAlt > 0) proposals.push("Add alt text to all images for better SEO");
    if (perfScore < 70) proposals.push("Optimize image sizes and caching to improve speed");
    if (seoScore < 80) proposals.push("Improve meta titles and descriptions for better search rankings");

    const getBusinessName = (title: string, hostname: string) => {
      const separators = [" | ", " - ", " : ", " – ", " — "];
      let name = title;
      for (const sep of separators) {
        if (name.includes(sep)) {
          const parts = name.split(sep);
          name = parts.reduce((a, b) => a.length <= b.length ? a : b);
          break;
        }
      }
      const genericWords = ["home", "welcome", "world", "index", "website"];
      if (!name || name.length < 3 || genericWords.includes(name.toLowerCase().trim())) {
        return hostname.replace("www.", "").split(".")[0].charAt(0).toUpperCase() + hostname.replace("www.", "").split(".")[0].slice(1);
      }
      return name.trim();
    };

    const businessName = getBusinessName($("title").text().trim(), new URL(lead.website).hostname);

    // 7. Update Database
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        businessName: businessName,
        performanceScore: perfScore,
        seoScore: seoScore,
        accessibilityScore: mobileData?.lighthouseResult?.categories?.accessibility?.score ? Math.round(mobileData.lighthouseResult.categories.accessibility.score * 100) : 0,
        bestPracticesScore: mobileData?.lighthouseResult?.categories?.["best-practices"]?.score ? Math.round(mobileData.lighthouseResult.categories["best-practices"].score * 100) : 0,
        pageSpeedPerformance: perfScore,
        pageSpeedSeo: seoScore,
        pageSpeedAccessibility: mobileData?.lighthouseResult?.categories?.accessibility?.score ? Math.round(mobileData.lighthouseResult.categories.accessibility.score * 100) : 0,
        pageSpeedBestPractices: mobileData?.lighthouseResult?.categories?.["best-practices"]?.score ? Math.round(mobileData.lighthouseResult.categories["best-practices"].score * 100) : 0,
        designScore: designScore,
        conversionScore: conversionScore,
        mobileScore: mobilePerf,
        desktopScore: desktopPerf,
        websiteScore: Math.round((perfScore + seoScore + designScore + conversionScore) / 4),
        leadScore: Math.round(((perfScore + seoScore + designScore + conversionScore) / 4) * 0.8 + 20),
        improvementProposals: proposals,
        topIssues: `H1: ${headings.h1}, H2: ${headings.h2}, H3: ${headings.h3}\nImages: ${images} (Missing Alt: ${imagesWithoutAlt})\nLinks: ${links}, CTAs: ${ctas}`,
        designAnalysis: designAnalysis as any,
        status: "Analyzed"
      }
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/audit?id=${leadId}`);
    return { success: true, lead: updatedLead };

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return { success: false, error: error.message };
  }
}

export async function runPageSpeed(leadId: string) {
  return analyzeWebsite(leadId); // Alias to new function
}

export async function captureWebsiteScreenshot(leadId: string) {
  if (process.env.VERCEL) {
    console.log("Screenshot skipped: Chromium is not supported on Vercel serverless functions.");
    return { success: false, error: "Chromium is not supported on Vercel." };
  }

  let browser;
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    const { chromium } = await import("playwright");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 1. Desktop Screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(lead.website, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    const desktopFileName = `desktop-${leadId}.png`;
    const desktopPublicPath = `/generated/screenshots/${desktopFileName}`;
    const desktopFullPath = path.join(process.cwd(), "public", "generated", "screenshots", desktopFileName);
    
    if (!fs.existsSync(path.dirname(desktopFullPath))) fs.mkdirSync(path.dirname(desktopFullPath), { recursive: true });
    await page.screenshot({ path: desktopFullPath });

    // 2. Mobile Screenshot (iPhone 13 style)
    await page.setViewportSize({ width: 390, height: 844 });
    // Some sites need a reload or specific UA for mobile view, but usually viewport is enough
    await page.goto(lead.website, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    const mobileFileName = `mobile-${leadId}.png`;
    const mobilePublicPath = `/generated/screenshots/${mobileFileName}`;
    const mobileFullPath = path.join(process.cwd(), "public", "generated", "screenshots", mobileFileName);
    
    await page.screenshot({ path: mobileFullPath });

    await prisma.lead.update({
      where: { id: leadId },
      data: { 
        desktopImage: desktopPublicPath,
        mobileImage: mobilePublicPath
      }
    });

    return { success: true, desktopPath: desktopPublicPath, mobilePath: mobilePublicPath };
  } catch (error: any) {
    console.error("Screenshot Error:", error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

export async function generateProposalPng(leadId: string, mode: "design" | "tech" = "design") {
  if (process.env.VERCEL) {
    console.log("PNG Generation skipped: Chromium is not supported on Vercel serverless functions.");
    return { success: false, error: "Chromium is not supported on Vercel." };
  }

  let browser;
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // We'll pass the mode as a query param to the proposal page
    const proposalUrl = `${siteUrl}/proposal/${leadId}?mode=${mode}`;

    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 1600 });
    
    await page.goto(proposalUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);

    const fileName = `proposal-${mode}-${leadId}.png`;
    const publicPath = `/generated/proposals/${fileName}`;
    const fullPath = path.join(process.cwd(), "public", "generated", "proposals", fileName);

    if (!fs.existsSync(path.dirname(fullPath))) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    }

    await page.screenshot({
      path: fullPath,
      fullPage: true,
      animations: "disabled"
    });

    const updateData: any = {};
    if (mode === "design") updateData.proposalImage = publicPath;
    else updateData.proposalImageTech = publicPath;

    await prisma.lead.update({
      where: { id: leadId },
      data: updateData
    });

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true, path: publicPath };

  } catch (error: any) {
    console.error(`PNG Generation Error (${mode}):`, error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

