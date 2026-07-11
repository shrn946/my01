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

// Revalidate cache every 7 days (updated on-demand via Server Actions)
export const revalidate = 604800;

const DEMO_WEBSITES = [
  {
    title: "Lawyers CoreWebLabs - Main Legal Hub",
    slug: "lawyers-coreweblabs-main-legal-hub",
    category: "Law Firms ⚖️",
    description: "A premium legal services portal and attorney directories landing hub for modern law practices and corporate law firms.",
    overview: "Designed as the main landing page, this legal portal directs clients to specialized attorneys, templates, and consultation channels.",
    problem: "Law firms need a centralized hub that builds deep trust and profiles different legal teams dynamically.",
    solution: "Built a modern, comprehensive lawyer hub with category navigation and quick consultation pathways.",
    result: "Significantly enhances patient and client registration rates.",
    tools: ["React", "Legal Hub", "SEO", "Responsive"],
    image: "/demo-screenshots/lawyers-main.jpg",
    gallery: ["/demo-screenshots/lawyers-main.jpg"],
    liveUrl: "https://lawyers.coreweblabs.com/",
    featured: true
  },
  {
    title: "Lawia - Attorney & Lawyers React Template",
    slug: "lawia-attorney-lawyers-react-template",
    category: "Law Firms ⚖️",
    description: "A premium React template for attorneys and law firms featuring clean legal consultations forms, lawyer bios, and case results counters.",
    overview: "A highly responsive React-based attorney template offering state-of-the-art visual components for legal representation.",
    problem: "Law firms struggle to find customizable templates that convey professional credibility and feature consult bookings.",
    solution: "Integrated a clean consultations form, modern team grids, and case result counters.",
    result: "Significantly improves new consultation request rates.",
    tools: ["React", "Lawyers", "Consulting", "Responsive"],
    image: "/demo-screenshots/lawyers-demo-1.jpg",
    gallery: ["/demo-screenshots/lawyers-demo-1.jpg"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-01",
    featured: true
  },
  {
    title: "Lawgne - Corporate Law Firm Template",
    slug: "lawgne-corporate-law-firm-template",
    category: "Law Firms ⚖️",
    description: "An elegant corporate law firm template designed for corporate legal departments, attorneys, legal counselors, and consulting firms.",
    overview: "A highly customizable corporate design system focusing on business law and corporate legal consultation workflows.",
    problem: "Corporate law firms require a highly serious and premium digital aesthetic to attract enterprise clients.",
    solution: "Created a sophisticated, grid-based dashboard layout highlighting areas of legal expertise.",
    result: "Drives higher corporate contact inquiry conversions.",
    tools: ["WordPress", "Corporate", "Grid"],
    image: "/demo-screenshots/lawyers-demo-2.jpg",
    gallery: ["/demo-screenshots/lawyers-demo-2.jpg"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-02",
    featured: false
  },
  {
    title: "Lawyers - Attorneys Business Template",
    slug: "lawyers-attorneys-business-template",
    category: "Law Firms ⚖️",
    description: "A classic trustworthy lawyers website template emphasizing practice areas, client testimonials, and online appointment requests.",
    overview: "Classic trustworthy theme highlighting attorney credentials, office locations, and legal case studies.",
    problem: "Legal practices struggle to organize multiple practice areas clearly on mobile devices.",
    solution: "Built responsive practice area grids and a sticky appointment scheduler.",
    result: "Improves appointment booking rates and user retention.",
    tools: ["Elementor", "Lawyers", "Trustworthy"],
    image: "/demo-screenshots/lawyers-demo-3.jpg",
    gallery: ["/demo-screenshots/lawyers-demo-3.jpg"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-03",
    featured: false
  },
  {
    title: "Juris - Criminal Defense and Personal Injury Law Firm",
    slug: "juris-criminal-defense-and-personal-injury-law-firm",
    category: "Law Firms ⚖️",
    description: "A comprehensive criminal defense and personal injury law firm website template with active case outcome trackers, attorney lists, and quick appointment booking.",
    overview: "Designed specifically for defense attorneys and litigation experts, this layout features a high-impact consultation call-to-action.",
    problem: "Litigation firms need to showcase successful case results and practice areas prominently to convert high-stress visitors.",
    solution: "Built a conversion-focused layout featuring prominent client testimonials, case studies, and easy-to-use consultation requests.",
    result: "Significantly increases consultation requests and client intake efficiency.",
    tools: ["React", "Criminal Law", "Responsive", "Case Studies"],
    image: "/demo-screenshots/lawyers-demo-4.png",
    gallery: ["/demo-screenshots/lawyers-demo-4.png"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-04",
    featured: false
  },
  {
    title: "Aegis Legal - Family Law & Estate Planning Template",
    slug: "aegis-legal-family-law-estate-planning-template",
    category: "Law Firms ⚖️",
    description: "A modern, empathetic web template designed for family law, divorce mediation, and estate planning attorneys.",
    overview: "A warm yet highly professional design system tailored for legal practitioners handling sensitive family disputes and legacy planning.",
    problem: "Family law practices require a balance of authoritative trust and reassuring design elements to engage emotional clients.",
    solution: "Implemented a clean, content-first layout with helpful FAQ modules, simple fee explainers, and confidential inquiry forms.",
    result: "Improves client trust scores and boosts direct inquiries for estate planning.",
    tools: ["WordPress", "Family Law", "FAQ Guide", "Elementor"],
    image: "/demo-screenshots/lawyers-demo-5.png",
    gallery: ["/demo-screenshots/lawyers-demo-5.png"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-05",
    featured: false
  },
  {
    title: "Lex Shield - Business Law & Intellectual Property Firm",
    slug: "lex-shield-business-law-intellectual-property-firm",
    category: "Law Firms ⚖️",
    description: "A premium corporate litigation and intellectual property protection law firm website designed to showcase business-focused legal consultations.",
    overview: "A high-end legal framework tailored specifically for enterprise corporate representation, patent litigation, and transaction attorneys.",
    problem: "Business law practitioners need an aesthetic that commands corporate authority while highlighting distinct IP registration workflows.",
    solution: "Designed a clean, corporate grid layout emphasizing corporate defense, copyright/trademark filings, and confidential inquiry forms.",
    result: "Drives higher corporate client intake and streamlines business litigation consultation pipelines.",
    tools: ["React", "Business Law", "IP Law", "Responsive"],
    image: "/demo-screenshots/lawyers-demo-6.jpg",
    gallery: ["/demo-screenshots/lawyers-demo-6.jpg"],
    liveUrl: "https://lawyers.coreweblabs.com/demo-06",
    featured: false
  },
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
    liveUrl: "https://clinic.coreweblabs.com/",
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
    liveUrl: "https://clinic.coreweblabs.com/demo-2",
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
    liveUrl: "https://clinic.coreweblabs.com/demo-3",
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
    liveUrl: "https://clinic.coreweblabs.com/demo-4",
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
    liveUrl: "https://clinic.coreweblabs.com/demo-5",
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
    liveUrl: "https://clinic.coreweblabs.com/demo-6",
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
    liveUrl: "https://clinic.coreweblabs.com/dental-7",
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
    liveUrl: "https://clinic.coreweblabs.com/eye-1",
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
    liveUrl: "https://clinic.coreweblabs.com/eye-2",
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
    liveUrl: "https://clinic.coreweblabs.com/eye-3",
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
    liveUrl: "https://clinic.coreweblabs.com/eye-4/",
    featured: false
  },
  {
    title: "Lumina Beauty & Aesthetics Clinic",
    slug: "lumina-beauty-aesthetics-clinic",
    category: "Beauty & Aesthetics",
    description: "A premium cosmetic clinic website featuring AI facial analysis, advanced plastic surgery showcases, appointment booking, and a comprehensive gallery of aesthetic transformations.",
    overview: "A high-impact beauty and aesthetics template built for modern cosmetic clinics offering surgical and non-surgical procedures with AI-powered skin analysis tools.",
    problem: "Beauty clinics struggle to convey the premium nature of their treatments and build patient confidence through digital channels alone.",
    solution: "Integrated an AI facial analysis feature, before-and-after galleries, pricing pages, and streamlined appointment booking flows.",
    result: "Boosted consultation bookings and elevated the clinic's premium brand positioning online.",
    tools: ["Beauty", "Aesthetics", "AI Analysis", "Booking"],
    image: "/demo-screenshots/clinic-demo-8.png",
    gallery: ["/demo-screenshots/clinic-demo-8.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-8",
    featured: false
  },
  {
    title: "MediZen Health & Medical Center",
    slug: "medizen-health-medical-center",
    category: "General Healthcare",
    description: "A comprehensive health and medical clinic template with multi-home layouts, doctor profiles, service pages, project case studies, and patient appointment scheduling.",
    overview: "A versatile and feature-rich medical website framework offering three distinct homepage variations to suit different healthcare branding needs.",
    problem: "General medical practices need a flexible digital presence that communicates expertise across multiple specialties without overwhelming patients.",
    solution: "Developed a multi-layout system with dedicated doctor directories, service hubs, and a clean appointment-first user journey.",
    result: "Increased patient trust and improved appointment conversion rates across multiple clinic departments.",
    tools: ["Healthcare", "Doctor Profiles", "Multi-layout", "Booking"],
    image: "/demo-screenshots/clinic-demo-9.png",
    gallery: ["/demo-screenshots/clinic-demo-9.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-9",
    featured: false
  },
  {
    title: "MediDental Premium Dental Surgery",
    slug: "medidental-premium-dental-surgery",
    category: "Dental Clinic",
    description: "A premium dental clinic and surgery website with multi-homepage options, transparent service showcases, doctor directories, project portfolios, and online appointment booking.",
    overview: "A sophisticated dental surgery template offering three home page styles, allowing practices to find the ideal aesthetic to match their brand identity.",
    problem: "Dental surgery centers often lack the visual credibility to attract high-value procedures like implants and oral surgeries online.",
    solution: "Created a premium multi-style homepage system with clinical imagery, transparent pricing, and comprehensive service breakdowns.",
    result: "Enhanced online credibility for dental surgeries and drove significant increases in high-value procedure inquiries.",
    tools: ["Dental", "Surgery", "Multi-layout", "Premium"],
    image: "/demo-screenshots/clinic-demo-10.png",
    gallery: ["/demo-screenshots/clinic-demo-10.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-10",
    featured: false
  },
  {
    title: "Pluxes Advanced Healthcare Services",
    slug: "pluxes-advanced-healthcare-services",
    category: "General Healthcare",
    description: "A premium medical and healthcare website template featuring multiple home versions, gallery pages, video galleries, testimonials, FAQ sections, and team doctor profiles.",
    overview: "A full-featured healthcare platform built for advanced medical service providers requiring comprehensive content management across services, teams, and patient resources.",
    problem: "Large healthcare organizations struggle to present diverse medical services, staff credentials, and patient resources in a cohesive digital experience.",
    solution: "Architected a multi-section platform with dedicated gallery, FAQ, case study, and pricing pages alongside four distinct homepage variants.",
    result: "Significantly improved patient navigation, engagement time on site, and appointment conversion rates.",
    tools: ["Healthcare", "Multi-page", "Gallery", "Testimonials"],
    image: "/demo-screenshots/clinic-demo-11.png",
    gallery: ["/demo-screenshots/clinic-demo-11.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-11",
    featured: false
  },
  {
    title: "Vamary Plastic Surgery & Medical Center",
    slug: "vamary-plastic-surgery-medical-center",
    category: "Beauty & Aesthetics",
    description: "A sophisticated plastic surgery and medical center template with eight home styles, an integrated shop, doctor directories, case studies, and full eCommerce functionality.",
    overview: "An ultra-premium plastic surgery platform combining clinical medical pages with a full-featured skincare and product shop for complete patient lifecycle management.",
    problem: "Plastic surgery clinics need to balance clinical credibility with luxury brand aesthetics while also selling aftercare products online.",
    solution: "Built a dual-purpose platform with eight stylistic homepage variations, complete shop with cart/checkout, and authoritative surgeon profile pages.",
    result: "Enabled clinics to generate revenue from both surgical consultations and aftercare product sales through a single premium website.",
    tools: ["Plastic Surgery", "eCommerce", "Multi-style", "Premium"],
    image: "/demo-screenshots/clinic-demo-12.png",
    gallery: ["/demo-screenshots/clinic-demo-12.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-12",
    featured: false
  },
  {
    title: "Resox Physiotherapy & Chiropractic Clinic",
    slug: "resox-physiotherapy-chiropractic-clinic",
    category: "Physiotherapy & Rehabilitation",
    description: "A professional physiotherapy and chiropractic clinic website featuring service pages for massage therapy, sport injuries, clinical pilates, and an integrated appointment booking form.",
    overview: "A clean and trustworthy physiotherapy clinic template focused on patient education, therapist credentials, and streamlined appointment scheduling.",
    problem: "Physiotherapy clinics often fail to communicate the breadth of their treatment offerings or differentiate their certified therapists effectively online.",
    solution: "Designed dedicated service detail pages for each treatment type alongside therapist bios, patient testimonials, and a gallery showcasing clinic facilities.",
    result: "Improved patient awareness of available treatments and increased new patient appointment bookings.",
    tools: ["Physiotherapy", "Rehabilitation", "Booking", "Services"],
    image: "/demo-screenshots/clinic-demo-13.png",
    gallery: ["/demo-screenshots/clinic-demo-13.png"],
    liveUrl: "https://clinic.coreweblabs.com/demo-13",
    featured: false
  }
];

import { PortfolioPageClient } from "@/components/portfolio-page-client";

export default async function PortfolioPage() {
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
          
          <PortfolioPageClient allWork={allWork} categories={categories} />
        </div>
      </section>
    </>
  );
}

