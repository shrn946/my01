import type { Metadata } from "next";
import Link from "next/link";
import { Grid3X3, Search } from "lucide-react";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { DemoGrid } from "@/components/demo-grid";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demo Websites",
  description: "Browse our live demo websites for dental clinics, optometry, and ophthalmology practices."
};

const DEMO_WEBSITES = [
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

export default async function DemoWebsitesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const categories = [
    "Dental Clinic",
    "Eye Care & Ophthalmology"
  ];
  
  const filteredDemos = category
    ? DEMO_WEBSITES.filter((demo) => slugify(demo.category) === category)
    : DEMO_WEBSITES;

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
