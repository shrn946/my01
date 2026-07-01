import type { Metadata } from "next";
import Link from "next/link";
import { Grid3X3, Search } from "lucide-react";
import * as cheerio from "cheerio";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { DemoGrid } from "@/components/demo-grid";
import { getPrisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demo Websites",
  description: "Browse our live demo websites for dental clinics, optometry, and ophthalmology practices."
};

// Revalidate cache every 10 minutes to maintain fast loading while keeping content updated
export const revalidate = 600;

const DEFAULT_DEMO_WEBSITES = [
  {
    title: "Primecare – Dentist & Dental Clinic",
    slug: "primecare",
    category: "Dental Clinic",
    description: "A premium dental practice template designed for modern clinics with booking facilities.",
    tools: ["Dentist", "Booking", "Clinic"],
    image: "/demo-screenshots/primecare.png",
    liveUrl: "https://clinics-lime.vercel.app/"
  },
  {
    title: "Clinic Demo 2",
    slug: "clinic-demo-2",
    category: "Dental Clinic",
    description: "A clean, responsive dental clinic homepage featuring team listings and services.",
    tools: ["Dental", "Services", "Modern"],
    image: "/demo-screenshots/clinic-demo-2.png",
    liveUrl: "https://clinics-lime.vercel.app/demo-2"
  },
  {
    title: "Clinic Demo 3",
    slug: "clinic-demo-3",
    category: "Dental Clinic",
    description: "An elegant healthcare website template suitable for family dentistry practices.",
    tools: ["Clinic", "Dentist", "Clean"],
    image: "/demo-screenshots/clinic-demo-3.png",
    liveUrl: "https://clinics-lime.vercel.app/demo-3"
  },
  {
    title: "Clinic Demo 4",
    slug: "clinic-demo-4",
    category: "Dental Clinic",
    description: "A dental medical layout highlighting patient reviews, dental pricing plans, and book appointment widgets.",
    tools: ["Healthcare", "Booking", "Responsive"],
    image: "/demo-screenshots/clinic-demo-4.png",
    liveUrl: "https://clinics-lime.vercel.app/demo-4"
  },
  {
    title: "Clinic Demo 5",
    slug: "clinic-demo-5",
    category: "Dental Clinic",
    description: "A comprehensive clinical template built for multi-specialty dental centers.",
    tools: ["Appointment", "Dentist", "Elementor"],
    image: "/demo-screenshots/clinic-demo-5.png",
    liveUrl: "https://clinics-lime.vercel.app/demo-5"
  },
  {
    title: "Clinic Demo 6",
    slug: "clinic-demo-6",
    category: "Dental Clinic",
    description: "A modern practice webpage focusing on patient education and treatments.",
    tools: ["Clinic", "Services", "WordPress"],
    image: "/demo-screenshots/clinic-demo-6.png",
    liveUrl: "https://clinics-lime.vercel.app/demo-6"
  },
  {
    title: "Clinic Dental 7",
    slug: "clinic-dental-7",
    category: "Dental Clinic",
    description: "A specialized orthodontic clinic interface highlighting treatments and technology.",
    tools: ["Dentistry", "Specialists", "Modern"],
    image: "/demo-screenshots/clinic-dental-7.png",
    liveUrl: "https://clinics-lime.vercel.app/dental-7"
  },
  {
    title: "Eye Clinic Demo 1",
    slug: "eye-clinic-demo-1",
    category: "Eye Care & Ophthalmology",
    description: "A professional optometry and ophthalmology landing page with vision check bookings.",
    tools: ["Ophthalmology", "Eye Clinic", "Services"],
    image: "/demo-screenshots/eye-clinic-demo-1.png",
    liveUrl: "https://clinics-lime.vercel.app/eye-1"
  },
  {
    title: "Eye Clinic Demo 2",
    slug: "eye-clinic-demo-2",
    category: "Eye Care & Ophthalmology",
    description: "An eye care specialist template built to highlight modern diagnostic machinery and doctor profiles.",
    tools: ["Optometry", "Doctor", "Booking"],
    image: "/demo-screenshots/eye-clinic-demo-2.png",
    liveUrl: "https://clinics-lime.vercel.app/eye-2"
  },
  {
    title: "Eye Clinic Demo 3",
    slug: "eye-clinic-demo-3",
    category: "Eye Care & Ophthalmology",
    description: "A clean optician and vision correction clinic website designed for optimal navigation.",
    tools: ["Ophthalmology", "Specialist", "Clean"],
    image: "/demo-screenshots/eye-clinic-demo-3.png",
    liveUrl: "https://clinics-lime.vercel.app/eye-3"
  }
];

async function fetchDemoDetails(url: string) {
  try {
    let category = "Dental Clinic";
    let image = "/pro.png";
    let tools = ["Clinic", "Services"];

    const urlLower = url.toLowerCase().trim();
    
    // Categorization based on URL keywords
    if (urlLower.includes("/eye-") || urlLower.includes("eye") || urlLower.includes("vision") || urlLower.includes("optometry")) {
      category = "Eye Care & Ophthalmology";
      tools = ["Ophthalmology", "Specialist", "Clean"];
    } else if (urlLower.includes("dent") || urlLower.includes("teeth") || urlLower.includes("tooth") || urlLower.includes("ortho")) {
      category = "Dental Clinic";
      tools = ["Dentist", "Booking", "Clinic"];
    }

    // Local image mappings for pre-captured high-quality screenshots
    if (urlLower.endsWith("clinics-lime.vercel.app") || urlLower.endsWith("clinics-lime.vercel.app/")) {
      image = "/demo-screenshots/primecare.png";
      tools = ["Dentist", "Booking", "Clinic"];
    } else if (urlLower.includes("/demo-2")) {
      image = "/demo-screenshots/clinic-demo-2.png";
      tools = ["Dental", "Services", "Modern"];
    } else if (urlLower.includes("/demo-3")) {
      image = "/demo-screenshots/clinic-demo-3.png";
      tools = ["Clinic", "Dentist", "Clean"];
    } else if (urlLower.includes("/demo-4")) {
      image = "/demo-screenshots/clinic-demo-4.png";
      tools = ["Healthcare", "Booking", "Responsive"];
    } else if (urlLower.includes("/demo-5")) {
      image = "/demo-screenshots/clinic-demo-5.png";
      tools = ["Appointment", "Dentist", "Elementor"];
    } else if (urlLower.includes("/demo-6")) {
      image = "/demo-screenshots/clinic-demo-6.png";
      tools = ["Clinic", "Services", "WordPress"];
    } else if (urlLower.includes("/dental-7")) {
      image = "/demo-screenshots/clinic-dental-7.png";
      tools = ["Dentistry", "Specialists", "Modern"];
    } else if (urlLower.includes("/eye-1")) {
      image = "/demo-screenshots/eye-clinic-demo-1.png";
      category = "Eye Care & Ophthalmology";
      tools = ["Ophthalmology", "Eye Clinic", "Services"];
    } else if (urlLower.includes("/eye-2")) {
      image = "/demo-screenshots/eye-clinic-demo-2.png";
      category = "Eye Care & Ophthalmology";
      tools = ["Optometry", "Doctor", "Booking"];
    } else if (urlLower.includes("/eye-3")) {
      image = "/demo-screenshots/eye-clinic-demo-3.png";
      category = "Eye Care & Ophthalmology";
      tools = ["Ophthalmology", "Specialist", "Clean"];
    } else {
      // Fallback to thum.io screenshot service for newly added external URLs
      image = `https://image.thum.io/get/width/1280/crop/800/${url}`;
    }

    // Fetch the page content with a 4-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title = $("title").text().trim() || 
                $('meta[property="og:title"]').attr("content")?.trim() || 
                $("h1").first().text().trim() || 
                "Clinic Demo";

    // Clean up title if it contains suffixes
    if (title.includes(" - ")) {
      title = title.split(" - ")[0].trim();
    } else if (title.includes(" | ")) {
      title = title.split(" | ")[0].trim();
    }

    // Extract description
    const description = $('meta[name="description"]').attr("content")?.trim() || 
                        $('meta[property="og:description"]').attr("content")?.trim() || 
                        `Live demo website for ${title}.`;

    return {
      title,
      slug: slugify(title) || Math.random().toString(36).substring(7),
      category,
      description,
      tools,
      image,
      liveUrl: url
    };
  } catch (error) {
    console.error(`Error fetching details for ${url}:`, error);
    
    // Resilient fallback configuration if url is unreachable/offline
    const cleanUrl = url.trim().replace(/\/$/, "");
    const parts = cleanUrl.split("/");
    const lastPart = parts[parts.length - 1];
    
    let title = lastPart;
    if (!title || title.includes("clinics-lime")) {
      title = "Clinic Demo";
    } else {
      title = title.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    
    let category = "Dental Clinic";
    if (url.includes("eye") || url.includes("vision") || url.includes("eye-")) {
      category = "Eye Care & Ophthalmology";
    }

    return {
      title,
      slug: slugify(title) || Math.random().toString(36).substring(7),
      category,
      description: `Live demo website for ${title}.`,
      tools: ["Clinic", "Services"],
      image: `https://image.thum.io/get/width/1280/crop/800/${url}`,
      liveUrl: url
    };
  }
}

export default async function DemoWebsitesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const categories = [
    "Dental Clinic",
    "Eye Care & Ophthalmology"
  ];

  let demoWebsitesList = DEFAULT_DEMO_WEBSITES;

  // Try to load urls dynamically from settings table in the database
  try {
    const prisma = getPrisma();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const urlsText = settings?.demoWebsiteUrls || "";
    const urls = urlsText.split("\n").map(u => u.trim()).filter(Boolean);
    
    if (urls.length > 0) {
      // Fetch details for all configured URLs in parallel
      demoWebsitesList = await Promise.all(urls.map(url => fetchDemoDetails(url)));
    }
  } catch (error) {
    console.error("Failed to load demo websites dynamically, falling back to defaults:", error);
  }
  
  const filteredDemos = category
    ? demoWebsitesList.filter((demo) => slugify(demo.category) === category)
    : demoWebsitesList;

  return (
    <>
      <InnerHero title="Demo Websites" breadcrumbs={[{ label: "Demo Websites" }]} />
      
      <section className="section !py-12 lg:!py-20">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Live Demos" 
            title="Premium clinic & medical templates" 
            text="Explore our collection of functional, high-performance website templates designed for dental practices and ophthalmology clinics." 
          />
          
          {/* Filter Bar */}
          <div className="sticky top-20 z-30 mb-16 flex overflow-x-auto sm:flex-wrap items-center sm:justify-center gap-2 rounded-[2rem] border border-black/5 bg-white/70 p-2 backdrop-blur-xl shadow-premium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
            <Link 
              href="/demo-websites" 
              className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${!category ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
            >
              <Grid3X3 size={14} /> All
            </Link>
            {categories.map((item) => {
              const slug = slugify(item);
              const active = category === slug;
              return (
                <Link 
                  key={item} 
                  href={`/demo-websites?category=${slug}`} 
                  className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          {filteredDemos.length ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <p className="text-sm font-bold text-slate-500">
                  Found <span className="text-ink">{filteredDemos.length}</span> templates
                </p>
              </div>
              
              <DemoGrid demos={filteredDemos} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">No templates found</h3>
              <p className="mt-2 text-slate-500">Try selecting a different category or view all demos.</p>
              <Link href="/demo-websites" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25">
                Clear All Filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
