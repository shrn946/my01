"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Code2,
  Laptop,
  Sparkles,
  Database,
  ShieldCheck,
  Clock,
  Smartphone,
  ChevronDown,
  Wrench,
  Activity,
  Layers,
  Globe,
  Settings,
  HelpCircle,
  Check,
  Cpu
} from "lucide-react";

export default function ServicesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const platforms = [
    { title: "Convert WordPress to Next.js", desc: "Convert your static pages to modern, React-based Next.js for lightning-fast speeds and top-tier security." },
    { title: "Squarespace to WordPress", desc: "Unlock endless customization options and robust SEO tools by migrating your site to self-hosted WordPress." },
    { title: "Wix to WordPress", desc: "Take back control of your site's functionality and database by migrating to a platform with no monthly fee caps." },
    { title: "Webflow to WordPress", desc: "Keep your premium front-end designs while gaining the flexibility of the world's most popular backend CMS." },
    { title: "HTML to WordPress", desc: "Convert static mockups and HTML landing pages into editable, dynamic Gutenberg-friendly layouts." },
    { title: "Figma to WordPress", desc: "Direct handoff from designs to clean, modular block components built for Elementor or custom themes." },
    { title: "PSD/XD to WordPress", desc: "Breathe new life into legacy assets by coding them into responsive, mobile-first layouts." },
    { title: "Shopify to WooCommerce", desc: "Scale your e-commerce shop without paying transaction fees or commission cuts on every checkout." }
  ];

  const faqs = [
    {
      q: "Why migrate to WordPress?",
      a: "WordPress powers over 43% of the internet because it offers complete ownership of your database, endless plugin capabilities, outstanding SEO plugins (like RankMath), and eliminates costly platform fees associated with builders like Wix or Squarespace."
    },
    {
      q: "Why choose Next.js?",
      a: "Next.js brings serverless performance, Static Site Generation (SSG), and Server-Side Rendering (SSR) to your website. This yields near-zero loading times, perfect Core Web Vitals, improved SEO crawls, and security as there's no active database exposed to hackers."
    },
    {
      q: "How long does a redesign take?",
      a: "A typical website redesign project takes between 4 to 8 weeks from discovery to deployment, depending on sitemap size, custom asset requirements, and third-party system integrations."
    },
    {
      q: "Can you migrate without downtime?",
      a: "Yes. We build and test the entire migrated website on a secure staging server. Once you audit the final build and give your complete approval, we update the DNS records, ensuring the switchover happens instantly with zero downtime."
    },
    {
      q: "Do you provide maintenance?",
      a: "Yes. We provide comprehensive monthly maintenance packages including automated weekly cloud backups, security scans, Core updates, speed testing, and minor content tweaks."
    },
    {
      q: "Will my SEO rankings be preserved?",
      a: "Absolutely. During redesigns and migrations, we map out all existing URLs and set up search-engine-friendly 301 redirects, ensuring you maintain your keyword rankings and domain authority."
    },
    {
      q: "Do you redesign existing websites?",
      a: "Yes. We can modernize outdated layouts, upgrade coding standards, optimize pages for mobile viewport responsiveness, and overhaul technical frameworks while preserving your brand identity and content archives."
    }
  ];

  return (
    <>
      {/* Redesigned Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="section-container relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <span className="eyebrow mx-auto mb-6 block w-max">Services</span>
            <h1 className="text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.1]">
              Modern Web <span className="text-primary bg-clip-text">Development</span> Services
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-slate-600 max-w-3xl mx-auto">
              From WordPress websites to blazing-fast Next.js applications, we build modern, high-performance websites that help businesses grow.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/proposal" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-soft transition-all duration-300 hover:bg-primary/95 hover:shadow-premium hover:-translate-y-0.5"
              >
                Get Free Proposal <ArrowRight size={18} />
              </Link>
              <Link 
                href="/portfolio" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-8 py-4 font-bold text-ink shadow-soft transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="section py-20 lg:py-28 bg-white">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Capabilities" 
            title="Tailored Solutions for Modern Brands" 
            text="Explore our core web services designed to elevate your online speed, branding, and search rankings." 
            outlineText="SERVICES"
          />

          <div className="grid gap-8 md:grid-cols-2 mt-12">
            {/* Card 1: Website Design & Development */}
            <FadeIn delay={0.1}>
              <article className="group h-full flex flex-col rounded-[2.5rem] border border-black/5 bg-slate-50/50 p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-premium hover:border-primary/20 lg:p-12">
                <div className="mb-8 flex items-center justify-between">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Laptop size={28} />
                  </div>
                  <span className="text-5xl font-black text-slate-200 transition-colors group-hover:text-primary/10">01</span>
                </div>
                <h3 className="text-3xl font-black text-ink group-hover:text-primary transition-colors">
                  Website Design & Development
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                  Custom-crafted digital experiences that look stunning on any screen size. We code clean, semantic templates centered on conversions.
                </p>
                <div className="mt-6 grid gap-3 grid-cols-2">
                  {["Custom WordPress", "Business Designs", "WooCommerce Setup", "Landing Pages"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-primary shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-8">
                  <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink group-hover:text-primary transition-colors">
                    Learn More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </FadeIn>

            {/* Card 2: Website Redesign */}
            <FadeIn delay={0.2}>
              <article className="group h-full flex flex-col rounded-[2.5rem] border border-black/5 bg-slate-50/50 p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-premium hover:border-primary/20 lg:p-12">
                <div className="mb-8 flex items-center justify-between">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Sparkles size={28} />
                  </div>
                  <span className="text-5xl font-black text-slate-200 transition-colors group-hover:text-primary/10">02</span>
                </div>
                <h3 className="text-3xl font-black text-ink group-hover:text-primary transition-colors">
                  Website Redesign
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                  Overhaul outdated layouts with lightweight modern styling, optimizing load times and streamlining the customer checkout path.
                </p>
                <div className="mt-6 grid gap-3 grid-cols-2">
                  {["Brand Modernization", "Responsive Tweaks", "UI/UX Enhancements", "WordPress Redesigns"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-primary shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-8">
                  <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink group-hover:text-primary transition-colors">
                    Learn More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Platform Migration Section */}
      <section className="section py-20 lg:py-28 bg-slate-50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Migrations" 
            title="Seamless Platform Migration" 
            text="Migrate your old website securely. We copy content layout by layout, set up 301 redirects, and ensure zero traffic drop." 
            outlineText="MIGRATE"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
            {platforms.map((p, idx) => (
              <FadeIn key={p.title} delay={idx * 0.05}>
                <div className="group h-full flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-6 shadow-soft transition-all duration-300 hover:border-primary/20 hover:shadow-premium hover:-translate-y-1">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Globe size={18} />
                    </div>
                    <h4 className="text-lg font-black text-ink group-hover:text-primary transition-colors">{p.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                  </div>
                  <div className="pt-6">
                    <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                      Learn More <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Next.js & WordPress Section (Grid layout side-by-side) */}
      <section className="section py-20 lg:py-28 bg-white">
        <div className="section-container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Next.js Development */}
            <FadeIn delay={0.1}>
              <div className="rounded-[2.5rem] border border-black/5 bg-slate-50/50 p-8 lg:p-12 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-ink">Next.js Development</h3>
                  <p className="mt-4 text-slate-500 leading-relaxed">
                    Unlock modern React architectures with Headless CMS setups, blazing load metrics, and custom API syncs.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      "Next.js Website Development",
                      "Headless WordPress Configuration",
                      "Static Site Generation (SSG)",
                      "Server-Side Rendering (SSR)",
                      "Third-Party API Integrations",
                      "Core Web Vitals Speed Tuning"
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-slate-600 text-sm font-semibold">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-2">Next.js Benefits</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Faster loading speeds, superior search indexation (SEO), enhanced React security protocols, and robust Core Web Vitals metrics out of the box.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* WordPress Development */}
            <FadeIn delay={0.2}>
              <div className="rounded-[2.5rem] border border-black/5 bg-slate-50/50 p-8 lg:p-12 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                    <Code2 size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-ink">WordPress Development</h3>
                  <p className="mt-4 text-slate-500 leading-relaxed">
                    Custom-built theme structures and clean hooks. We build modular Gutenberg configurations without unnecessary bloat.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      "Custom Gutenberg Themes",
                      "Custom Plugins from Scratch",
                      "Elementor & Page Builders Development",
                      "ACF Custom Field Layouts",
                      "WooCommerce E-Commerce Stores",
                      "Membership & Paywall Portals",
                      "Custom Booking & Schedule Systems"
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-slate-600 text-sm font-semibold">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <h4 className="text-sm font-black text-primary uppercase tracking-wider mb-2">WordPress Benefits</h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Complete autonomy over layouts, massive library extensions, SEO optimization, and standard responsive Gutenberg tools built-in.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Speed Optimization & Maintenance Section */}
      <section className="section py-20 lg:py-28 bg-slate-950 text-white relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Speed Optimization */}
            <FadeIn delay={0.1}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <span className="eyebrow bg-white/10 text-white border-white/20">Speed Tuning</span>
                  <h3 className="text-4xl font-black text-white mt-4">Website Optimization</h3>
                  <p className="mt-4 text-slate-400 leading-relaxed text-sm">
                    Slow sites lose sales. We rewrite databases, compression, caching codes, and image structures to make pages load in under 1.5 seconds.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      "Core Web Vitals Optimization",
                      "Database Cleanup & Queries",
                      "Asset Concatenation",
                      "Browser Caching Logic",
                      "Lossless Image Formatting",
                      "Technical SEO Structuring",
                      "Security Hardening Hooks"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Website Maintenance */}
            <FadeIn delay={0.2}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <span className="eyebrow bg-white/10 text-white border-white/20">Security & Support</span>
                  <h3 className="text-4xl font-black text-white mt-4">Website Maintenance</h3>
                  <p className="mt-4 text-slate-400 leading-relaxed text-sm">
                    Protect your database. We perform weekly theme audits, malware scans, server monitoring, and backup cycles so you sleep peacefully.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      "Weekly Database Backups",
                      "Realtime Threat Monitoring",
                      "WordPress & Plugin Updates",
                      "Malware Scans & Cleaning",
                      "Uptime Check Notifications",
                      "Weekly Performance Audits",
                      "General Content Edits"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Redesigned Development Process (7 Step Timeline) */}
      <section className="section py-20 lg:py-28 bg-slate-50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Workflow" 
            title="Our Development Process" 
            text="A robust 7-stage pipeline centered on transparency, speed, and pixel-perfect quality control." 
            outlineText="TIMELINE"
          />

          <div className="relative mt-16 pl-8 border-l border-primary/20 max-w-4xl mx-auto space-y-12">
            {[
              { step: "01", title: "Discovery", desc: "We gather requirements, analyze your user demographic, and define sitemap specifications." },
              { step: "02", title: "Planning", desc: "Creating structural wireframes, navigation flow, and selecting the optimal technology stack." },
              { step: "03", title: "Design", desc: "Coding high-fidelity mockups, UI components, and defining interactive style guides." },
              { step: "04", title: "Development", desc: "Setting up repositories, custom databases, styling frameworks, and coding custom modules." },
              { step: "05", title: "Testing", desc: "Rigorous responsive layout checks, lighthouse speed tests, link audits, and cross-browser QA." },
              { step: "06", title: "Launch", desc: "Updating nameservers, configuring caching layers, sitemap indexing, and seamless deployment." },
              { step: "07", title: "Ongoing Support", desc: "Weekly updates, malware scans, cloud database backups, and visual edits as required." }
            ].map((step, idx) => (
              <FadeIn key={step.step} delay={idx * 0.1} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[45px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-white transition-colors">{step.step}</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-ink group-hover:text-primary transition-colors">{step.title}</h4>
                  <p className="mt-2 text-base text-slate-500 max-w-2xl leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose CoreWebLabs (Premium Feature Grid) */}
      <section className="section py-20 lg:py-28 bg-white">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Values" 
            title="Why Choose CoreWebLabs" 
            text="We bring technical precision and commercial strategy to help your digital business flourish." 
            outlineText="BENEFITS"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
            {[
              { icon: <Clock size={20} />, title: "9+ Years Experience", desc: "Delivering hundreds of custom websites and databases since 2017." },
              { icon: <Code2 size={20} />, title: "WordPress Experts", desc: "Advanced customization of themes, queries, hooks, and clean APIs." },
              { icon: <Zap size={20} />, title: "Next.js Specialists", desc: "Pioneering Headless CMS stacks, serverless layouts, and fast routing." },
              { icon: <Globe size={20} />, title: "SEO Optimized", desc: "Semantic DOM hierarchies built to crawl and index easily on Google." },
              { icon: <Activity size={20} />, title: "Lightning Performance", desc: "Clean code practices tailored for sub-1.5 second loading times." },
              { icon: <Smartphone size={20} />, title: "Mobile First Design", desc: "Seamless UX layouts optimized across tablets and small touchscreens." },
              { icon: <ShieldCheck size={20} />, title: "Secure Development", desc: "Input sanitization, database parameterization, and secure endpoints." },
              { icon: <Wrench size={20} />, title: "Ongoing Support", desc: "A reliable post-launch team ready to jump on adjustments and edits." }
            ].map((f, idx) => (
              <FadeIn key={f.title} delay={idx * 0.05}>
                <div className="group h-full rounded-2xl border border-black/5 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:border-primary/20 hover:shadow-premium">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {f.icon}
                  </div>
                  <h4 className="text-lg font-black text-ink">{f.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="section py-20 lg:py-28 bg-slate-50">
        <div className="section-container text-center">
          <SectionHeading 
            eyebrow="Tech Stack" 
            title="Technologies We Trust" 
            text="We use reliable, modern, and high-performance frameworks to build your website." 
            outlineText="STACK"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-4xl mx-auto">
            {[
              "WordPress", "Next.js", "React", "TypeScript", 
              "Tailwind CSS", "Elementor", "WooCommerce", "ACF", 
              "PHP", "MySQL", "Vercel", "Cloudflare"
            ].map((t) => (
              <span 
                key={t} 
                className="px-6 py-3 rounded-full border border-black/5 bg-white text-sm font-bold text-slate-700 shadow-soft hover:border-primary/30 transition-colors cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section py-20 lg:py-28 bg-white">
        <div className="section-container">
          <SectionHeading 
            eyebrow="FAQs" 
            title="Frequently Asked Questions" 
            text="Got questions about web design, platforms, or migrations? We have answers." 
            outlineText="HELP"
          />

          <div className="max-w-3xl mx-auto mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <FadeIn key={faq.q} delay={idx * 0.05}>
                <div className="border border-black/5 rounded-2xl overflow-hidden bg-slate-50/50 transition-all duration-300">
                  <button
                    className="w-full flex items-center justify-between p-6 text-left font-black text-ink hover:text-primary transition-colors focus:outline-none"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-primary" : ""}`} 
                    />
                  </button>
                  <div 
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{ 
                      maxHeight: activeFaq === idx ? "200px" : "0px",
                      opacity: activeFaq === idx ? 1 : 0
                    }}
                  >
                    <div className="p-6 pt-0 border-t border-black/5 text-sm leading-relaxed text-slate-500 bg-white">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 left-10 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        <div className="section-container relative z-10 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Ready to Modernize Your Website?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-300 max-w-2xl mx-auto">
            Whether you need a complete redesign, migrate from Squarespace, Wix, or Webflow to WordPress, or convert your existing WordPress website into a lightning-fast Next.js application, CoreWebLabs can help.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/proposal" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-soft transition-all duration-300 hover:bg-primary/95 hover:shadow-premium hover:-translate-y-0.5"
            >
              Get Free Proposal <ArrowRight size={18} />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-8 py-4 font-bold text-white shadow-soft transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
