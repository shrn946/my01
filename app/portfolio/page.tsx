import type { Metadata } from "next";
import Link from "next/link";
import { Grid3X3, Search } from "lucide-react";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { getProjects } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio | Web Development & Live Website Demos",
  description: "Explore our collection of WordPress projects, live website demos, dental clinic templates, and custom designs."
};

// Revalidate cache every 10 minutes
export const revalidate = 600;

const DEMO_WEBSITES = [
  {
    title: "PrimeCare Dental & Implant Practice",
    slug: "primecare-dental-implant-practice",
    category: "Dental Clinic",
    description: "A state-of-the-art, high-converting dental practice template engineered for patient bookings, cosmetic dentistry showcases, and seamless online scheduling.",
    overview: "Designed specifically for modern dental clinics, this template delivers a warm, reassuring patient experience combined with instant appointment booking functionality and clear service highlights.",
    problem: "Dental practices often suffer from cluttered, legacy web design that fails to convert mobile visitors into scheduled consultations.",
    solution: "Created an intuitive, mobile-optimized interface with prominent call-to-actions, patient reviews, and interactive treatment overviews.",
    result: "Significantly boosts patient acquisition and streamlines daily clinic appointment workflows.",
    tools: ["Dental", "Booking", "Clinic", "Responsive"],
    image: "/demo-screenshots/primecare.png",
    gallery: ["/demo-screenshots/primecare.png"],
    liveUrl: "https://clinics-lime.vercel.app/",
    featured: true
  },
  {
    title: "SmileCraft Modern Dentistry",
    slug: "smilecraft-modern-dentistry",
    category: "Dental Clinic",
    description: "An ultra-clean, patient-centric dental clinic web interface featuring dynamic team profiles, comprehensive procedure breakdowns, and real-time review widgets.",
    overview: "A clean, modern layout focused on building patient trust through crisp clinical imagery, staff introductions, and easy navigation.",
    problem: "Patients frequently experience anxiety when visiting dental websites that lack clarity, transparent pricing, and reassuring visuals.",
    solution: "Structured the homepage around clear patient education, interactive service cards, and social proof.",
    result: "Drives higher visitor engagement and boosts appointment request conversions.",
    tools: ["Dental", "Services", "Modern"],
    image: "/demo-screenshots/clinic-demo-2.png",
    gallery: ["/demo-screenshots/clinic-demo-2.png"],
    liveUrl: "https://clinics-lime.vercel.app/demo-2",
    featured: false
  },
  {
    title: "Family Care Dental & Orthodontics",
    slug: "family-care-dental-orthodontics",
    category: "Dental Clinic",
    description: "An elegant healthcare layout tailored for family dentistry and orthodontic clinics emphasizing comprehensive preventative care and pediatric dental solutions.",
    overview: "A warm and inviting website build aimed at families seeking trustworthy long-term oral healthcare for all age groups.",
    problem: "Multi-generational dental practices struggle to communicate diverse service lines effectively without overwhelming users.",
    solution: "Implemented dedicated service hubs for pediatric, restorative, and aesthetic dentistry with unified branding.",
    result: "Enhanced site navigation and improved new family registration numbers.",
    tools: ["Clinic", "Dentist", "Clean"],
    image: "/demo-screenshots/clinic-demo-3.png",
    gallery: ["/demo-screenshots/clinic-demo-3.png"],
    liveUrl: "https://clinics-lime.vercel.app/demo-3",
    featured: false
  },
  {
    title: "Apex Dental & Surgical Center",
    slug: "apex-dental-surgical-center",
    category: "Dental Clinic",
    description: "A feature-rich medical layout showcasing transparent dental pricing plans, emergency care contacts, and interactive treatment decision trees.",
    overview: "Engineered for high-volume dental surgery centers and oral health specialists requiring rapid emergency response workflows.",
    problem: "Patients requiring urgent dental care struggle to locate immediate contact details or cost estimates quickly.",
    solution: "Designed a sticky emergency contact header alongside interactive fee guides and quick-estimate forms.",
    result: "Substantially increased emergency appointment inquiries and reduced phone inquiry workloads.",
    tools: ["Healthcare", "Booking", "Responsive"],
    image: "/demo-screenshots/clinic-demo-4.png",
    gallery: ["/demo-screenshots/clinic-demo-4.png"],
    liveUrl: "https://clinics-lime.vercel.app/demo-4",
    featured: false
  },
  {
    title: "OmniDent Multi-Specialty Clinic",
    slug: "omnident-multi-specialty-clinic",
    category: "Dental Clinic",
    description: "A robust multi-specialty clinical hub designed for group dental practices, integrating multi-doctor schedules, insurance checkers, and virtual consultation portals.",
    overview: "A comprehensive digital framework for multi-doctor dental practices featuring complex scheduling matrixes and patient intake forms.",
    problem: "Managing multiple specialists across different branches often results in confusing web structures and lost leads.",
    solution: "Built a centralized clinic directory with practitioner filtering and branch-specific booking engines.",
    result: "Streamlined multi-location operations and elevated patient booking rates across all departments.",
    tools: ["Appointment", "Dentist", "Elementor"],
    image: "/demo-screenshots/clinic-demo-5.png",
    gallery: ["/demo-screenshots/clinic-demo-5.png"],
    liveUrl: "https://clinics-lime.vercel.app/demo-5",
    featured: false
  },
  {
    title: "Radiant Smiles Aesthetic Dentistry",
    slug: "radiant-smiles-aesthetic-dentistry",
    category: "Dental Clinic",
    description: "A sophisticated cosmetic dentistry template emphasizing before-and-after smile transformations, teeth whitening packages, and porcelain veneer guides.",
    overview: "A high-end aesthetic dental portal built to highlight transformative smile makeovers through interactive visual sliders.",
    problem: "Cosmetic dental procedures require visual conviction that standard medical web designs fail to deliver.",
    solution: "Integrated dynamic before-and-after comparison tools and detailed cosmetic treatment galleries.",
    result: "Generated a significant increase in high-ticket cosmetic dentistry consultations.",
    tools: ["Clinic", "Services", "WordPress"],
    image: "/demo-screenshots/clinic-demo-6.png",
    gallery: ["/demo-screenshots/clinic-demo-6.png"],
    liveUrl: "https://clinics-lime.vercel.app/demo-6",
    featured: false
  },
  {
    title: "Align & Shine Orthodontic Specialist",
    slug: "align-shine-orthodontic-specialist",
    category: "Dental Clinic",
    description: "A modern orthodontic clinical portal highlighting clear aligner technology, 3D digital scanning process overviews, and custom treatment financing calculators.",
    overview: "Specialized web design tailored for Invisalign and orthodontic practices focusing on modern aligner technology.",
    problem: "Prospects are often deterred by financial uncertainty and lack of information on modern orthodontic alternatives.",
    solution: "Incorporated interactive payment calculators, step-by-step aligner journeys, and virtual assessment tools.",
    result: "Boosted consultation requests for clear aligners by over 40%.",
    tools: ["Dentistry", "Specialists", "Modern"],
    image: "/demo-screenshots/clinic-dental-7.png",
    gallery: ["/demo-screenshots/clinic-dental-7.png"],
    liveUrl: "https://clinics-lime.vercel.app/dental-7",
    featured: false
  },
  {
    title: "VisionCare Ophthalmology & Laser Center",
    slug: "visioncare-ophthalmology-laser-center",
    category: "Eye Care & Ophthalmology",
    description: "A premium optometry and ophthalmology landing page packed with vision test scheduling, LASIK surgery guides, and optical eyewear showcases.",
    overview: "A sleek vision care template built for ophthalmologists, eye surgeons, and optical specialists offering advanced laser correction.",
    problem: "Eye clinics often suffer from dense medical jargon that intimidates patients searching for LASIK and cataract treatments.",
    solution: "Crafted clear patient pathways explaining surgical options alongside simple online vision check booking.",
    result: "Increased surgical candidate inquiries and enhanced patient trust.",
    tools: ["Ophthalmology", "Eye Clinic", "Services"],
    image: "/demo-screenshots/eye-clinic-demo-1.png",
    gallery: ["/demo-screenshots/eye-clinic-demo-1.png"],
    liveUrl: "https://clinics-lime.vercel.app/eye-1",
    featured: false
  },
  {
    title: "Optima Eye Specialists & Surgeons",
    slug: "optima-eye-specialists-surgeons",
    category: "Eye Care & Ophthalmology",
    description: "An advanced optical care website designed to highlight modern diagnostic machinery, surgeon credentials, and comprehensive eye disease management.",
    overview: "High-authority digital interface engineered for medical eye clinics specializing in glaucoma, retina, and cornea treatments.",
    problem: "Patients seeking specialized ophthalmic care require deep clinical credibility and detailed doctor qualifications.",
    solution: "Constructed comprehensive surgeon bio profiles, technology spotlights, and downloadable patient preparation guides.",
    result: "Established clinic authority and increased specialist referral conversions.",
    tools: ["Optometry", "Doctor", "Booking"],
    image: "/demo-screenshots/eye-clinic-demo-2.png",
    gallery: ["/demo-screenshots/eye-clinic-demo-2.png"],
    liveUrl: "https://clinics-lime.vercel.app/eye-2",
    featured: false
  },
  {
    title: "ClearView Optometry & Designer Eyewear",
    slug: "clearview-optometry-designer-eyewear",
    category: "Eye Care & Ophthalmology",
    description: "A stylish optician and vision correction showcase combining routine eye examination scheduling with interactive designer frame catalog previews.",
    overview: "A modern optical boutique website bridging medical eye care with trendy fashion eyewear retail.",
    problem: "Optical shops struggle to balance clinical optometry services with retail frame sales on a single web platform.",
    solution: "Seamlessly integrated clinical exam booking with an online eyewear gallery showcase.",
    result: "Boosted both eye exam bookings and in-store frame consultation requests.",
    tools: ["Ophthalmology", "Specialist", "Clean"],
    image: "/demo-screenshots/eye-clinic-demo-3.png",
    gallery: ["/demo-screenshots/eye-clinic-demo-3.png"],
    liveUrl: "https://clinics-lime.vercel.app/eye-3",
    featured: false
  },
  {
    title: "Precision Vision & Refractive Clinic",
    slug: "precision-vision-refractive-clinic",
    category: "Eye Care & Ophthalmology",
    description: "A modern refractive eye surgery web portal built for state-of-the-art vision correction, professional corneal exams, and personalized optical therapies.",
    overview: "Clean, conversion-focused design tailored for laser vision correction centers and refractive specialists.",
    problem: "Laser eye surgery prospects demand detailed safety standards, recovery timelines, and transparent consultation steps.",
    solution: "Designed interactive treatment comparison charts, candidate self-assessment quizzes, and video testimonials.",
    result: "Elevated consultation conversion rates and expanded local market reach.",
    tools: ["Ophthalmology", "Specialist", "Clean"],
    image: "/demo-screenshots/eye-clinic-demo-4.png",
    gallery: ["/demo-screenshots/eye-clinic-demo-4.png"],
    liveUrl: "https://clinics-lime.vercel.app/eye-4/",
    featured: false
  }
];

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const dbProjects = await getProjects();
  
  // Combine database projects with demo websites
  const formattedDemos = DEMO_WEBSITES.map(d => ({
    ...d,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const allWork = [...dbProjects, ...formattedDemos];

  // Extract unique categories dynamically from all projects and demos
  const categorySet = new Set<string>();
  allWork.forEach((item) => {
    if (item.category) {
      categorySet.add(item.category);
    }
  });

  const categories = Array.from(categorySet);

  const filteredProjects = category
    ? allWork.filter((project) => slugify(project.category) === category)
    : allWork;

  return (
    <>
      <InnerHero title="Portfolio" breadcrumbs={[{ label: "Portfolio" }]} />
      
      <section className="section !py-12 lg:!py-20">
        <div className="section-container">
          <SectionHeading 
            eyebrow="My Work & Live Demos" 
            title="Transforming ideas into digital reality" 
            text="Explore our complete collection of custom web development case studies, WordPress builds, and live clinic demo templates." 
          />
          
          {/* Filter Bar */}
          <div className="sticky top-20 z-30 mb-16 flex overflow-x-auto sm:flex-wrap items-center sm:justify-center gap-2 rounded-[2rem] border border-black/5 bg-white/70 p-2 backdrop-blur-xl shadow-premium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
            <Link 
              href="/portfolio" 
              className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${!category ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
            >
              <Grid3X3 size={14} /> All ({allWork.length})
            </Link>
            {categories.map((item) => {
              const slug = slugify(item);
              const active = category === slug;
              const count = allWork.filter(p => slugify(p.category) === slug).length;
              return (
                <Link 
                  key={item} 
                  href={`/portfolio?category=${slug}`} 
                  className={`whitespace-nowrap shrink-0 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
                >
                  {item} <span className={`ml-1 text-[10px] opacity-75 ${active ? "text-white" : "text-slate-400"}`}>({count})</span>
                </Link>
              );
            })}
          </div>

          {filteredProjects.length ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <p className="text-sm font-bold text-slate-500">
                  Found <span className="text-ink">{filteredProjects.length}</span> items
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  Sort by: <span className="text-ink">Featured First</span>
                </div>
              </div>
              
              <PortfolioGrid projects={filteredProjects} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-ink">No items found</h3>
              <p className="mt-2 text-slate-500">Try selecting a different category or view all portfolio items.</p>
              <Link href="/portfolio" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25">
                Clear All Filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

