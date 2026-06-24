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

export function formatPhoneNumbers(rawPhone: string | null | undefined, countryContext?: string): string[] {
  if (!rawPhone) return [];
  
  // Split by comma or slash if multiple numbers
  const rawList = rawPhone.split(/[,/|]/).map(p => p.trim()).filter(Boolean);
  const validNumbers = new Set<string>();

  rawList.forEach(num => {
    // Filter out scientific notation or pure floats (e.g. 1.0000000000)
    if (num.match(/^\d+\.\d+$/)) return;
    
    // Extract only digits and leading plus
    let clean = num.replace(/(?!^\+)[^\d]/g, '');
    
    // Ignore obviously invalid lengths
    if (clean.replace('+', '').length < 7 || clean.replace('+', '').length > 15) return;
    
    // Ignore known bad numeric strings from scraping
    if (clean.includes("3914031309545") || clean.includes("8623138256371")) return;

    // Formatting based on detected or explicit country code
    let formatted = clean;
    const countryStr = (countryContext || "").toLowerCase();

    // United States / Canada (+1)
    if (clean.length === 10 && !clean.startsWith('+')) {
      formatted = `+1 (${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
    } else if (clean.startsWith('1') && clean.length === 11) {
      formatted = `+1 (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
    } else if (clean.startsWith('+1') && clean.length === 12) {
      formatted = `+1 (${clean.slice(2, 5)}) ${clean.slice(5, 8)}-${clean.slice(8)}`;
    } 
    // United Kingdom (+44)
    else if (countryStr.includes("uk") || countryStr.includes("united kingdom") || clean.startsWith('+44') || (clean.startsWith('0') && clean.length === 11)) {
      if (clean.startsWith('0')) clean = '+44' + clean.slice(1);
      if (!clean.startsWith('+') && clean.startsWith('44')) clean = '+' + clean;
      
      if (clean.startsWith('+44') && clean.length >= 12) {
        formatted = `+44 ${clean.slice(3, 7)} ${clean.slice(7)}`;
      } else {
        formatted = clean;
      }
    } 
    // Australia (+61)
    else if (countryStr.includes("australia") || clean.startsWith('+61') || (clean.startsWith('0') && clean.length === 10)) {
      if (clean.startsWith('0')) clean = '+61' + clean.slice(1);
      if (!clean.startsWith('+') && clean.startsWith('61')) clean = '+' + clean;
      
      if (clean.startsWith('+61')) {
        formatted = `+61 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
      } else {
        formatted = clean;
      }
    }
    // Generic International
    else {
      if (!clean.startsWith('+') && clean.length >= 11) {
        formatted = '+' + clean;
      } else {
        formatted = clean; // As is, but clean of spaces/letters
      }
    }

    validNumbers.add(formatted);
  });

  return Array.from(validNumbers);
}

export function cleanPhoneForHref(formattedPhone: string): string {
  return formattedPhone.replace(/[^\d+]/g, '');
}
