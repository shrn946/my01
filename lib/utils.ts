import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLACEHOLDER_IMAGE = "/pro.png";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function detectBusinessCategory(
  businessName: string = "",
  title: string = "",
  metaDescription: string = "",
  url: string = "",
  htmlText: string = ""
): string {
  const combinedText = `${businessName} ${title} ${metaDescription} ${url} ${htmlText}`.toLowerCase();

  // 1. Dentist
  if (combinedText.includes("dentist") || combinedText.includes("dental") || combinedText.includes("orthodont") || combinedText.includes("teeth") || combinedText.includes("endodont") || combinedText.includes("periodont")) {
    return "Dentist";
  }
  // 2. Lawyer
  if (combinedText.includes("lawyer") || combinedText.includes("law firm") || combinedText.includes("attorney") || combinedText.includes("legal service") || combinedText.includes("solicitor") || combinedText.includes("barrister") || combinedText.includes("advocate")) {
    return "Lawyer";
  }
  // 3. Restaurant
  if (combinedText.includes("restaurant") || combinedText.includes("cafe") || combinedText.includes("diner") || combinedText.includes("bistro") || combinedText.includes("pizza") || combinedText.includes("bakery") || combinedText.includes("pub") || combinedText.includes("grill") || combinedText.includes("sushi") || combinedText.includes("cuisine") || combinedText.includes("steakhouse") || combinedText.includes("coffee shop") || combinedText.includes("eatery") || combinedText.includes("food delivery")) {
    return "Restaurant";
  }
  // 4. Real Estate
  if (combinedText.includes("real estate") || combinedText.includes("realtor") || combinedText.includes("realty") || combinedText.includes("property management") || combinedText.includes("properties") || combinedText.includes("brokerage") || combinedText.includes("mortgage")) {
    return "Real Estate";
  }
  // 5. Plumber
  if (combinedText.includes("plumber") || combinedText.includes("plumbing") || combinedText.includes("drain cleaning") || combinedText.includes("leak repair") || combinedText.includes("water heater") || combinedText.includes("clogged drain")) {
    return "Plumber";
  }
  // 6. Electrician
  if (combinedText.includes("electrician") || combinedText.includes("electrical") || combinedText.includes("wiring") || combinedText.includes("lighting repair") || combinedText.includes("power outage") || combinedText.includes("panel upgrade")) {
    return "Electrician";
  }
  // 7. Roofing
  if (combinedText.includes("roofing") || combinedText.includes("roofer") || combinedText.includes("roof repair") || combinedText.includes("shingles") || combinedText.includes("gutters") || combinedText.includes("roof installation")) {
    return "Roofing";
  }
  // 8. Medical Clinic
  if (combinedText.includes("clinic") || combinedText.includes("medical") || combinedText.includes("pediatric") || combinedText.includes("health center") || combinedText.includes("physiotherapy") || combinedText.includes("chiropract") || combinedText.includes("doctor") || combinedText.includes("physician") || combinedText.includes("hospital") || combinedText.includes("wellness center") || combinedText.includes("cardiolog") || combinedText.includes("dermatolog") || combinedText.includes("therapist")) {
    return "Medical Clinic";
  }
  // 9. Fitness Gym
  if (combinedText.includes("gym") || combinedText.includes("fitness") || combinedText.includes("workout") || combinedText.includes("crossfit") || combinedText.includes("yoga studio") || combinedText.includes("pilates") || combinedText.includes("personal trainer") || combinedText.includes("athletics") || combinedText.includes("bodybuilding")) {
    return "Fitness Gym";
  }
  // 10. Web Design Agency
  if (combinedText.includes("web design") || combinedText.includes("website design") || combinedText.includes("web development") || combinedText.includes("wordpress design") || combinedText.includes("squarespace design") || combinedText.includes("website development")) {
    return "Web Design Agency";
  }
  // 11. Marketing Agency
  if (combinedText.includes("marketing agency") || combinedText.includes("digital marketing") || combinedText.includes("seo agency") || combinedText.includes("social media marketing") || combinedText.includes("advertising agency") || combinedText.includes("pr agency") || combinedText.includes("creative agency") || combinedText.includes("branding agency")) {
    return "Marketing Agency";
  }
  // 12. E-commerce
  if (combinedText.includes("shopify") || combinedText.includes("e-commerce") || combinedText.includes("ecommerce") || combinedText.includes("online store") || combinedText.includes("shop online") || combinedText.includes("checkout") || combinedText.includes("cart") || combinedText.includes("add to cart") || combinedText.includes("retail store") || combinedText.includes("woo commerce") || combinedText.includes("woocommerce")) {
    return "E-commerce";
  }
  // 13. Accounting
  if (combinedText.includes("accounting") || combinedText.includes("accountant") || combinedText.includes("bookkeeping") || combinedText.includes("tax service") || combinedText.includes("cpa") || combinedText.includes("audit service") || combinedText.includes("financial advisor") || combinedText.includes("wealth management")) {
    return "Accounting";
  }
  // 14. Insurance
  if (combinedText.includes("insurance") || combinedText.includes("underwriter") || combinedText.includes("car insurance") || combinedText.includes("health insurance") || combinedText.includes("life insurance") || combinedText.includes("home insurance") || combinedText.includes("agency insurance") || combinedText.includes("policy quotes")) {
    return "Insurance";
  }
  // 15. Automotive
  if (combinedText.includes("automotive") || combinedText.includes("auto repair") || combinedText.includes("car repair") || combinedText.includes("mechanic") || combinedText.includes("dealership") || combinedText.includes("collision center") || combinedText.includes("towing") || combinedText.includes("car service") || combinedText.includes("auto detail")) {
    return "Automotive";
  }

  return "Other";
}
