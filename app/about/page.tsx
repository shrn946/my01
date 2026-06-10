import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { profile } from "@/lib/profile";
import { CheckCircle2, Award, Rocket, Code, Heart, Sparkles } from "lucide-react";
import { Magnetic } from "@/components/magnetic";

export const metadata: Metadata = {
  title: "About",
  description: "About Hassan Naqvi, a freelance WordPress developer specializing in Elementor, WooCommerce, plugins, and performance."
};

export default function AboutPage() {
  return (
    <>
      <InnerHero title="About Me" breadcrumbs={[{ label: "About" }]} />
      
      <section className="section relative overflow-hidden bg-white">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
          <div className="absolute top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary blur-[120px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <SectionHeading 
                align="left"
                eyebrow="Introduction" 
                title={`${profile.name}, your dedicated WordPress partner.`} 
                outlineText="STORY"
              />
              <div className="space-y-8 text-lg leading-relaxed text-slate-600">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">{profile.bio}</p>
                <p>With over 8 years of specialized experience, I've helped hundreds of businesses transform their online presence. My approach combines technical excellence with a deep understanding of conversion optimization and user experience.</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Award, label: "8+ Years Exp.", color: "text-blue-500 bg-blue-500/10" },
                    { icon: Rocket, label: "500+ Projects", color: "text-emerald-500 bg-emerald-500/10" },
                    { icon: Code, label: "Clean Code", color: "text-purple-500 bg-purple-500/10" },
                    { icon: Heart, label: "Client Focused", color: "text-rose-500 bg-rose-500/10" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-slate-50 p-4 transition-all hover:border-primary/20 hover:shadow-soft group">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <item.icon size={22} />
                      </div>
                      <span className="font-bold text-sm text-ink">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div className="relative group">
                {/* Decorative Frame */}
                <div className="absolute -inset-4 rounded-[3.5rem] border-2 border-primary/10 transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-1" />
                
                {/* mission card - Keeping a high-contrast dark version as it's a 'cool' accent, but ensuring it works in light mode */}
                <div className="relative overflow-hidden rounded-[3rem] bg-ink p-10 lg:p-14 text-white shadow-2xl shadow-primary/10">
                  <div className="noise-overlay" />
                  
                  <div className="relative z-10">
                    <Sparkles className="text-primary mb-8 animate-pulse" size={40} />
                    <h3 className="text-3xl font-black leading-tight text-white">
                      "Building for the <span className="text-primary italic">long-term</span>."
                    </h3>
                    <p className="mt-8 text-lg leading-relaxed text-slate-300">
                      I don't just build websites; I build reliable digital foundations. Every project is an opportunity to solve a unique business challenge through smart WordPress architecture and elegant design.
                    </p>
                    
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {["Performance First", "SEO Optimized", "Easy to Manage", "Security Focused"].map((point) => (
                        <div key={point} className="flex items-center gap-3 group/item">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-white">
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="font-bold text-sm text-slate-200">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Background Glow Block */}
                  <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-[80px]" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="section bg-slate-50/50">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Expertise" 
            title="My Technical Toolkit" 
            text="I specialize in the WordPress ecosystem, with deep expertise in various tools and technologies."
            outlineText="SKILLS"
          />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {profile.skills.map((skill, index) => (
              <FadeIn key={skill} delay={index * 0.05} className="bento-card group hover:border-primary/20 bg-white">
                <h4 className="font-black text-ink transition-colors group-hover:text-primary">{skill}</h4>
                <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${85 + (index % 15)}%` }} 
                  />
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Proficiency</span>
                  <span>{85 + (index % 15)}%</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="section bg-white">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Journey" 
            title="Professional Timeline" 
            outlineText="HISTORY"
          />
          
          <div className="relative mx-auto max-w-4xl space-y-12 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200 lg:before:left-1/2 lg:before:-translate-x-1/2">
            {[
              { year: "2024 - Present", title: "Senior WordPress Consultant", desc: "Leading complex enterprise WordPress projects and high-performance WooCommerce builds for global clients." },
              { year: "2021 - 2023", title: "Full-Stack WordPress Developer", desc: "Specialized in custom plugin development and advanced Elementor design systems." },
              { year: "2018 - 2021", title: "Elementor Expert & UI/UX Designer", desc: "Focused on creating visually stunning and conversion-optimized websites using Elementor Pro." },
              { year: "2016 - 2018", title: "Junior WordPress Developer", desc: "Started the journey by mastering theme customization and basic plugin architecture." },
            ].map((item, index) => (
              <FadeIn key={item.year} delay={index * 0.1} className={`relative pl-12 lg:pl-0 lg:flex ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
                <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-primary text-primary shadow-xl lg:left-1/2 lg:-translate-x-1/2 group">
                  <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-150" />
                </div>
                <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pl-16" : "lg:pr-16 lg:text-right"}`}>
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-black text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
