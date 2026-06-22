import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Users, Briefcase, Zap, Rocket, Shield, Cpu, Layout } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { Counter } from "@/components/counter";
import { Magnetic } from "@/components/magnetic";
import { ProjectCard } from "@/components/project-card";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { getHeroSlides, getProjects, getBlogPosts, getReviews } from "@/lib/data";
import { services } from "@/lib/seed-data";

export default async function HomePage() {
  const [slides, featuredProjects, featuredPosts, featuredReviews] = await Promise.all([
    getHeroSlides(true),
    getProjects(true),
    getBlogPosts(true),
    getReviews(true)
  ]);

  return (
    <>
      <HeroSlider slides={slides} />

      {/* Services Section - Bento Grid */}
      <section className="section relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary blur-[120px]" />
        </div>

        <div className="section-container relative z-10">
          <SectionHeading 
            eyebrow="Expertise" 
            title="WordPress solutions for modern businesses" 
            text="Transforming your vision into a high-performance reality with expert WordPress development, custom Elementor designs, and robust WooCommerce systems." 
            outlineText="SOLUTIONS"
          />
          <div className="grid gap-6 md:grid-cols-4 lg:grid-rows-2">
            {/* Main Service - Large Card - Now Light with Primary Accents */}
            <FadeIn className="md:col-span-2 md:row-span-2 bento-card bg-slate-50 overflow-hidden group border-primary/10">
              <div className="relative z-10 flex h-full flex-col justify-between p-2">
                <div>
                  <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Rocket size={32} />
                  </div>
                  <h3 className="text-4xl font-black leading-tight text-ink">{services[0].title}</h3>
                  <p className="mt-6 text-lg leading-relaxed text-slate-600">
                    {services[0].description}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {["Custom Theme Dev", "Speed Optimization", "Security Audits"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                        <CheckCircle2 size={18} className="text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/services" className="group mt-12 inline-flex items-center gap-2 font-black text-primary transition-all hover:gap-4">
                  Explore Solutions <ArrowRight size={20} />
                </Link>
              </div>
              <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary/5 blur-[80px] transition-all duration-700 group-hover:bg-primary/10 group-hover:scale-125" />
            </FadeIn>

            {/* Secondary Services */}
            {[
              { ...services[1], icon: Layout, color: "bg-blue-500/10 text-blue-500" },
              { ...services[2], icon: Shield, color: "bg-emerald-500/10 text-emerald-500" },
              { ...services[3], icon: Cpu, color: "bg-purple-500/10 text-purple-500" },
              { ...services[4], icon: Zap, color: "bg-amber-500/10 text-amber-500" },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.1} className="bento-card group hover:border-primary/20 bg-white">
                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <service.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-ink transition-colors group-hover:text-primary">{service.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">{service.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Now Light */}
      <section className="relative overflow-hidden bg-slate-50 py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-[100px]" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
        </div>
        
        <div className="section-container relative z-10">
          <div className="grid gap-12 text-center md:grid-cols-3">
            {[
              { label: "Projects Completed", value: "500+", icon: Briefcase },
              { label: "Happy Clients", value: "250+", icon: Users },
              { label: "Years Experience", value: "8+", icon: Zap },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <div className="flex flex-col items-center group">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-primary shadow-soft border border-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white">
                    <stat.icon size={36} />
                  </div>
                  <span className="text-6xl font-black text-ink sm:text-7xl tracking-tight">
                    <Counter value={stat.value} />
                  </span>
                  <span className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary transition-colors">{stat.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section bg-white">
        <div className="section-container">
          <div className="flex flex-col items-end justify-between gap-8 md:flex-row md:items-center mb-16">
            <SectionHeading 
              align="left"
              eyebrow="Portfolio" 
              title="Featured Case Studies" 
              text="Explore our latest web projects, from custom enterprise sites to complex WooCommerce builds."
              outlineText="PROJECTS"
              className="mb-0"
            />
            <Magnetic>
              <Link href="/portfolio" className="group inline-flex items-center gap-3 rounded-full bg-slate-50 px-8 py-4 text-sm font-bold text-ink shadow-sm border border-black/5 hover:border-primary/20 hover:shadow-soft transition-all">
                View All Projects <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.slice(0, 3).map((project, index) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section bg-slate-50/50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Testimonials" 
            title="What our clients are saying" 
            text="Trusted by businesses worldwide to deliver reliable, high-performing web solutions."
            outlineText="TRUSTED"
          />
          <ReviewsCarousel reviews={featuredReviews} />
        </div>
      </section>

      {/* CTA Section - Keeping Primary Blue for high impact */}
      <section className="section overflow-hidden">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-[3rem] bg-primary px-8 py-20 text-center lg:py-32 shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 z-0 opacity-40">
              <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse" />
              <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-950/20 blur-3xl animate-pulse" />
            </div>
            
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                Ready to grow?
              </span>
              <h2 className="mt-8 text-4xl font-black text-white sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                Let's build something <span className="text-blue-950">extraordinary</span> together.
              </h2>
              <p className="mt-8 text-lg text-white/80 max-w-2xl mx-auto">
                Whether you need a new build, a performance boost, or ongoing maintenance, we're here to help your web presence succeed.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-6">
                <Magnetic>
                  <Link href="/contact" className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-bold text-primary transition-all hover:scale-105 active:scale-95 shadow-xl">
                    Start My Project <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
                <Link href="/about" className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-10 py-5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
