import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Users, Briefcase, Zap } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { FadeIn } from "@/components/fade-in";
import { HeroSlider } from "@/components/hero-slider";
import { ProjectCard } from "@/components/project-card";
import { ReviewsCarousel } from "@/components/reviews-carousel";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { getBlogPosts, getHeroSlides, getProjects, getReviews } from "@/lib/data";
import { profile } from "@/lib/profile";
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

      {/* Services Section */}
      <section className="section overflow-hidden">
        <SectionHeading 
          eyebrow="Services" 
          title="WordPress solutions for modern businesses" 
          text="Transforming your vision into a high-performance reality with expert WordPress development, custom Elementor designs, and robust WooCommerce systems." 
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.05} className="group relative rounded-3xl border border-black/5 bg-white p-8 shadow-soft transition-all hover:-translate-y-2 hover:shadow-premium">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <ServiceIcon title={service.title} />
              </div>
              <h3 className="text-xl font-black text-ink">{service.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">{service.description}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn More <ArrowRight size={14} />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-coal py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="grid gap-12 text-center md:grid-cols-3">
            {[
              { label: "Projects Completed", value: "500+", icon: Briefcase },
              { label: "Happy Clients", value: "250+", icon: Users },
              { label: "Years Experience", value: "8+", icon: Zap },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-primary backdrop-blur-sm">
                    <stat.icon size={32} />
                  </div>
                  <span className="text-5xl font-black text-white sm:text-6xl">{stat.value}</span>
                  <span className="mt-3 text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section bg-slate-50/50">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
          <SectionHeading 
            align="left"
            eyebrow="Portfolio" 
            title="Featured Case Studies" 
            text="Explore my latest WordPress projects, from custom enterprise sites to complex WooCommerce builds."
          />
          <Link href="/portfolio" className="group mb-16 inline-flex items-center gap-2 font-bold text-primary">
            View All Projects <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {featuredProjects.slice(0, 3).map((project, index) => (
            <FadeIn key={project.slug} delay={index * 0.1}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section">
        <SectionHeading 
          eyebrow="Reviews" 
          title="What my clients are saying" 
          text="Trusted by businesses worldwide to deliver reliable, high-performing WordPress solutions."
        />
        <ReviewsCarousel reviews={featuredReviews} />
      </section>

      {/* Blog Section */}
      <section className="section bg-slate-50/50">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
          <SectionHeading 
            align="left"
            eyebrow="Insights" 
            title="Latest from the blog" 
            text="Tips, tricks and deep dives into WordPress development and digital growth."
          />
          <Link href="/blog" className="group mb-16 inline-flex items-center gap-2 font-bold text-primary">
            Read More Articles <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {featuredPosts.slice(0, 3).map((post, index) => (
            <FadeIn key={post.slug} delay={index * 0.1}>
              <BlogCard post={post} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-20 text-center lg:py-32">
          <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-blue-600 blur-3xl" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground/80 backdrop-blur-sm">
              Ready to grow?
            </span>
            <h2 className="mt-8 text-4xl font-black text-white sm:text-6xl leading-[1.1]">
              Let's build something <span className="text-primary">extraordinary</span> together.
            </h2>
            <p className="mt-8 text-lg text-slate-300">
              Whether you need a new build, a performance boost, or ongoing maintenance, I'm here to help your WordPress site succeed.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="group inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-primary/25">
                Start My Project <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-10 py-5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10">
                Learn More About Me
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
