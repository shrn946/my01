"use server";

import { getPrisma } from "@/lib/prisma";
import { createAgency, getAgencies } from "@/lib/agency-actions";
import { revalidatePath } from "next/cache";

export async function getFilteredAgencies(filters: {
  search?: string;
  status?: string;
  country?: string;
  services?: string[];
  techStack?: string[];
}) {
  return getAgencies(filters);
}

export async function importAgenciesFromCSV(csvText: string) {
  try {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV file is empty");

    const header = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const records = [];

    // Fields: Name, Website, Contact Name, Email, LinkedIn, Country, City, Services, Tech, Notes, Status
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle comma inside quotes simple parser
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ""));

      const record: any = {};
      header.forEach((key, idx) => {
        const val = values[idx] || "";
        if (key.toLowerCase().includes("name") && !key.toLowerCase().includes("contact")) record.name = val;
        else if (key.toLowerCase().includes("website") || key.toLowerCase().includes("url")) record.website = val;
        else if (key.toLowerCase().includes("contact")) record.contactName = val;
        else if (key.toLowerCase().includes("email")) record.email = val;
        else if (key.toLowerCase().includes("linkedin")) record.linkedin = val;
        else if (key.toLowerCase().includes("country")) record.country = val;
        else if (key.toLowerCase().includes("city")) record.city = val;
        else if (key.toLowerCase().includes("notes")) record.notes = val;
        else if (key.toLowerCase().includes("status")) record.status = val;
        else if (key.toLowerCase().includes("services")) record.services = val ? val.split(";").map(s => s.trim()) : [];
        else if (key.toLowerCase().includes("tech")) record.techStack = val ? val.split(";").map(t => t.trim()) : [];
      });

      if (record.name && record.website) {
        records.push(record);
      }
    }

    let successCount = 0;
    for (const record of records) {
      const res = await createAgency({
        name: record.name,
        website: record.website,
        contactName: record.contactName || "",
        email: record.email || "",
        linkedin: record.linkedin || "",
        country: record.country || "",
        city: record.city || "",
        services: record.services || [],
        techStack: record.techStack || [],
        notes: record.notes || "",
        status: record.status || "New"
      });
      if (res.success) successCount++;
    }

    revalidatePath("/agency/agencies");
    revalidatePath("/agency/dashboard");
    return { success: true, count: successCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function autoCrawlAgencyWebsite(url: string) {
  const normalizeUrl = (u: string) => {
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      return "https://" + u;
    }
    return u;
  };
  
  const targetUrl = normalizeUrl(url);
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return { success: false, error: "Invalid Website URL format." };
  }

  const baseOrigin = parsedUrl.origin;
  const fallbackName = parsedUrl.hostname.replace("www.", "").split(".")[0];
  const capitalizedFallback = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  let res;
  let html = "";
  try {
    res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(6000)
    });

    if (res && res.ok) {
      html = await res.text();
    } else {
      return {
        success: true,
        name: capitalizedFallback,
        website: targetUrl,
        emails: [],
        phone: "",
        linkedin: "",
        note: `Note: Website scan blocked by cloud firewall (Status ${res?.status || "Unknown"}). Fallback record created.`
      };
    }
  } catch (e: any) {
    return {
      success: true,
      name: capitalizedFallback,
      website: targetUrl,
      emails: [],
      phone: "",
      linkedin: "",
      note: `Note: Connection timed out or DNS failed during scan. Fallback record created.`
    };
  }

  try {
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    // Get Title
    let title = $("title").text().trim();
    title = title.replace(/^(Home|Welcome|Index|Main|About)\s*[-|:|•]\s*/i, "");
    title = title.split(/\s*[-|:|•|\|]\s*/)[0].trim();

    const emails = new Set<string>();
    const phones = new Set<string>();
    const socialLinks = new Set<string>();
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    const extractFromText = (text: string) => {
      const e = text.match(emailRegex);
      if (e) e.forEach(m => {
        if (!/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(m)) {
          emails.add(m.trim().toLowerCase());
        }
      });
      const p = text.match(phoneRegex);
      if (p) p.forEach(m => phones.add(m.trim()));
    };

    extractFromText($("body").text());

    // Extract links
    const contactLinks: string[] = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (href.startsWith("mailto:")) {
        const mail = href.replace("mailto:", "").trim().split("?")[0].toLowerCase();
        if (mail && !/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(mail)) {
          emails.add(mail);
        }
      }
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

    // Crawl contact page(s)
    const uniqueContact = Array.from(new Set(contactLinks)).slice(0, 2);
    for (const link of uniqueContact) {
      try {
        const cRes = await fetch(link, { next: { revalidate: 0 } });
        const cHtml = await cRes.text();
        const $c = cheerio.load(cHtml);
        extractFromText($c("body").text());
        
        $c("a").each((_, el) => {
          const href = $c(el).attr("href");
          if (!href) return;
          if (href.startsWith("mailto:")) {
            const mail = href.replace("mailto:", "").trim().split("?")[0].toLowerCase();
            if (mail && !/\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i.test(mail)) {
              emails.add(mail);
            }
          }
          const lower = href.toLowerCase();
          if (lower.includes("linkedin.com/")) {
            socialLinks.add(href);
          }
        });
      } catch (e) {
        // ignore
      }
    }

    // Try to find LinkedIn specifically from socials
    let linkedin = "";
    socialLinks.forEach(link => {
      if (link.includes("linkedin.com/")) linkedin = link;
    });

    return {
      success: true,
      name: title || parsedUrl.hostname.replace("www.", "").split(".")[0],
      website: targetUrl,
      emails: Array.from(emails),
      phone: Array.from(phones)[0] || "",
      linkedin: linkedin
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function scanAndUpdateAgencyWebsite(id: string) {
  try {
    const prisma = getPrisma();
    const agency = await prisma.agency.findUnique({ where: { id } });
    if (!agency) throw new Error("Agency not found");

    const crawlResult = await autoCrawlAgencyWebsite(agency.website);
    if (!crawlResult.success) throw new Error(crawlResult.error || "Crawl failed");

    // Propose primary email address
    let emailUpdate = agency.email;
    if (!agency.email && crawlResult.emails && crawlResult.emails.length > 0) {
      emailUpdate = crawlResult.emails[0];
    }

    const updated = await prisma.agency.update({
      where: { id },
      data: {
        name: agency.name === "New Agency" || agency.name === "" || agency.name.startsWith("coreweblabs-to") ? (crawlResult.name || agency.name) : agency.name,
        email: emailUpdate,
        linkedin: agency.linkedin || crawlResult.linkedin || null,
        notes: crawlResult.phone ? `Phone: ${crawlResult.phone}\n${agency.notes || ""}` : agency.notes
      }
    });

    revalidatePath("/agency/agencies");
    return { success: true, agency: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
