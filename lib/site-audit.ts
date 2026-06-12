import * as cheerio from "cheerio";

type SiteAudit = {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  mobileScore: number;
  desktopScore: number;
  issues: string[];
};

const clamp = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function auditWebsiteHtml(html: string, url: string): SiteAudit {
  if (!html.trim()) {
    return {
      performanceScore: 0,
      seoScore: 0,
      accessibilityScore: 0,
      bestPracticesScore: url.startsWith("https://") ? 20 : 0,
      mobileScore: 0,
      desktopScore: 0,
      issues: ["The website could not be fetched, so the local audit could not be completed"],
    };
  }

  const $ = cheerio.load(html);
  const issues: string[] = [];

  const images = $("img");
  const scripts = $("script[src]");
  const stylesheets = $("link[rel='stylesheet']");
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const missingAlt = images.filter((_, element) => {
    const alt = $(element).attr("alt");
    return alt === undefined || alt.trim() === "";
  }).length;
  const lazyImages = images.filter("[loading='lazy']").length;
  const unlabeledInputs = $("input, select, textarea").filter((_, element) => {
    const id = $(element).attr("id");
    const ariaLabel = $(element).attr("aria-label");
    const ariaLabelledBy = $(element).attr("aria-labelledby");
    return !ariaLabel && !ariaLabelledBy && !(id && $(`label[for='${id}']`).length);
  }).length;

  let performance = 100;
  if (htmlBytes > 500_000) {
    performance -= 25;
    issues.push("The HTML document is larger than 500 KB");
  } else if (htmlBytes > 200_000) {
    performance -= 12;
    issues.push("The HTML document is relatively large");
  }
  if (scripts.length > 20) {
    performance -= 20;
    issues.push("The page loads more than 20 external scripts");
  } else if (scripts.length > 10) {
    performance -= 10;
    issues.push("The page loads many external scripts");
  }
  if (stylesheets.length > 10) performance -= 8;
  if (images.length > 0 && lazyImages / images.length < 0.5) {
    performance -= 10;
    issues.push("Most images are not configured for lazy loading");
  }
  if ($("img[srcset], picture").length === 0 && images.length > 2) {
    performance -= 8;
    issues.push("Responsive images are not detected");
  }

  let seo = 100;
  const title = $("title").text().trim();
  const description = $("meta[name='description']").attr("content")?.trim() || "";
  if (!title) {
    seo -= 25;
    issues.push("The page has no title");
  } else if (title.length < 20 || title.length > 65) {
    seo -= 8;
    issues.push("The page title length could be improved");
  }
  if (!description) {
    seo -= 20;
    issues.push("The page has no meta description");
  } else if (description.length < 70 || description.length > 170) {
    seo -= 7;
  }
  if ($("h1").length !== 1) {
    seo -= 15;
    issues.push("The page should contain one clear H1 heading");
  }
  if (!$("link[rel='canonical']").attr("href")) seo -= 8;
  if (!$("meta[name='viewport']").attr("content")) {
    seo -= 12;
    issues.push("The viewport meta tag is missing");
  }
  if (missingAlt > 0) seo -= Math.min(15, missingAlt * 3);

  let accessibility = 100;
  if (!$("html").attr("lang")) {
    accessibility -= 12;
    issues.push("The HTML language attribute is missing");
  }
  if (missingAlt > 0) {
    accessibility -= Math.min(25, missingAlt * 4);
    issues.push(`${missingAlt} image(s) are missing useful alt text`);
  }
  if (unlabeledInputs > 0) {
    accessibility -= Math.min(25, unlabeledInputs * 5);
    issues.push(`${unlabeledInputs} form control(s) do not have detectable labels`);
  }
  if ($("h1, h2, h3, h4, h5, h6").length === 0) accessibility -= 15;
  if ($("button:empty, a:empty").length > 0) accessibility -= 8;

  let bestPractices = 100;
  if (!url.startsWith("https://")) {
    bestPractices -= 30;
    issues.push("The website is not using HTTPS");
  }
  if ($("script[src^='http://'], img[src^='http://'], link[href^='http://']").length > 0) {
    bestPractices -= 20;
    issues.push("The HTTPS page contains insecure resource URLs");
  }
  if ($("a[target='_blank']:not([rel~='noopener'])").length > 0) {
    bestPractices -= 10;
    issues.push("Some new-tab links do not use rel=noopener");
  }
  if ($("input[type='password']").length > 0 && !url.startsWith("https://")) bestPractices -= 20;

  const performanceScore = clamp(performance);
  return {
    performanceScore,
    seoScore: clamp(seo),
    accessibilityScore: clamp(accessibility),
    bestPracticesScore: clamp(bestPractices),
    mobileScore: clamp(performanceScore - ($("meta[name='viewport']").length ? 5 : 20)),
    desktopScore: performanceScore,
    issues: Array.from(new Set(issues)).slice(0, 8),
  };
}
