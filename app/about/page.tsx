import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { profile } from "@/lib/profile";
import { CheckCircle2, Award, Rocket, Code, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "About Hassan Naqvi, a freelance WordPress developer specializing in Elementor, WooCommerce, plugins, and performance."
};

export default function AboutPage() {
  return (
    <>
      <InnerHero title="About Me" breadcrumbs={[{ label: "About" }]} />
      
      <section className="section">
        <div className="grid gap-16 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading 
              align="left"
              eyebrow="Introduction" 
              title={`${profile.name}, your dedicated WordPress partner.`} 
            />
            <div className="space-y-6 text-lg leading-relaxed text-slate-500">
              <p>{profile.bio}</p>
              <p>With over 8 years of specialized experience, I've helped hundreds of businesses transform their online presence. My approach combines technical excellence with a deep understanding of conversion optimization and user experience.</p>
              
              <div className="grid grid-cols-2 gap-6 pt-8">
                {[
                  { icon: Award, label: "8+ Years Exp." },
                  { icon: Rocket, label: "500+ Projects" },
                  { icon: Code, label: "Clean Code" },
                  { icon: Heart, label: "Client Focused" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-ink">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full rounded-[3rem] border-2 border-primary/10" />
              <div className="relative overflow-hidden rounded-[3rem] bg-ink p-12 text-white shadow-premium">
                <h3 className="text-2xl font-black italic text-primary">"Building for the long-term."</h3>
                <p className="mt-8 text-lg leading-relaxed text-slate-300">
                  I don't just build websites; I build reliable digital foundations. Every project is an opportunity to solve a unique business challenge through smart WordPress architecture and elegant design.
                </p>
                <div className="mt-12 space-y-4">
                  {["Performance First", "SEO Optimized", "Easy to Manage", "Security Focused"].map((point) => (
                    <div key={point} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-primary" />
                      <span className="font-bold text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Skills Section */}
      <section className="section bg-slate-50/50">
        <SectionHeading 
          eyebrow="Expertise" 
          title="My Technical Toolkit" 
          text="I specialize in the WordPress ecosystem, with deep expertise in various tools and technologies."
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {profile.skills.map((skill, index) => (
            <FadeIn key={skill} delay={index * 0.05} className="rounded-2xl border border-black/5 bg-white p-6 shadow-soft transition-all hover:shadow-premium">
              <h4 className="font-black text-ink">{skill}</h4>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-primary" style={{ width: `${85 + (index % 15)}%` }} />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="section">
        <SectionHeading 
          eyebrow="Journey" 
          title="Professional Timeline" 
        />
        
        <div className="relative mx-auto max-w-4xl space-y-12 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200 lg:before:left-1/2 lg:before:-translate-x-1/2">
          {[
            { year: "2024 - Present", title: "Senior WordPress Consultant", desc: "Leading complex enterprise WordPress projects and high-performance WooCommerce builds for global clients." },
            { year: "2021 - 2023", title: "Full-Stack WordPress Developer", desc: "Specialized in custom plugin development and advanced Elementor design systems." },
            { year: "2018 - 2021", title: "Elementor Expert & UI/UX Designer", desc: "Focused on creating visually stunning and conversion-optimized websites using Elementor Pro." },
            { year: "2016 - 2018", title: "Junior WordPress Developer", desc: "Started the journey by mastering theme customization and basic plugin architecture." },
          ].map((item, index) => (
            <FadeIn key={item.year} delay={index * 0.1} className={`relative pl-12 lg:pl-0 lg:flex ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
              <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 lg:left-1/2 lg:-translate-x-1/2">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
              <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pl-16" : "lg:pr-16 lg:text-right"}`}>
                <span className="text-sm font-bold text-primary">{item.year}</span>
                <h3 className="mt-2 text-xl font-black text-ink">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
