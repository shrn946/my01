import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { FadeIn } from "@/components/fade-in";
import { services } from "@/lib/seed-data";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "CoreWebLabs offers expert Next.js, React, WordPress, WooCommerce, custom development, and long-term maintenance services."
};

export default function ServicesPage() {
  return (
    <>
      <InnerHero title="Our Services" breadcrumbs={[{ label: "Services" }]} />
      
      <section className="section !py-12 lg:!py-24">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Expertise" 
            title="Web solutions tailored for your growth" 
            text="We provide end-to-end web development solutions designed to improve performance, boost conversions, and simplify management." 
          />
          
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.05}>
                <article className="group flex h-full flex-col rounded-[2rem] border border-black/5 bg-white p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-premium lg:p-12">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <ServiceIcon title={service.title} />
                    </div>
                    <span className="text-5xl font-black text-slate-100 transition-colors group-hover:text-primary/10">
                      0{index + 1}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-ink group-hover:text-primary transition-colors">
                    {service.title}
                  </h2>
                  
                  <p className="mt-6 text-lg leading-relaxed text-slate-500">
                    {service.description}
                  </p>
                  
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {["Expert Implementation", "Proven Results", "ongoing Support", "Tailored Strategy"].map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <CheckCircle2 size={16} className="text-primary" /> {point}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-10">
                    <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink group-hover:text-primary transition-colors">
                      Learn more about this service <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-slate-950 text-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        <div className="section-container relative z-10">
          <SectionHeading 
            eyebrow="Workflow" 
            title="How we deliver success" 
            text="A proven, transparent process designed to turn your vision into a high-performance digital reality."
            outlineText="PROCESS"
            className="[&_h2]:!text-white [&_p]:!text-slate-400 [&_span.select-none]:!text-white/5"
          />
          
          <div className="grid gap-6 md:grid-cols-4 mt-16 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

            {[
              { step: "01", title: "Discovery", desc: "Understanding your goals, audience, and technical needs." },
              { step: "02", title: "Strategy", desc: "Crafting a custom roadmap and design system." },
              { step: "03", title: "Execution", desc: "Building your solution with precision and care." },
              { step: "04", title: "Launch", desc: "Rigorous testing and a seamless deployment." },
            ].map((item, index) => (
              <FadeIn key={item.step} delay={index * 0.15} className="relative group">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:shadow-primary/20 z-10">
                    <span className="text-3xl font-black text-white/40 group-hover:text-primary transition-colors duration-500">{item.step}</span>
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="relative z-10 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/20 group-hover:bg-white/10 flex-1 w-full flex flex-col justify-center items-center shadow-2xl">
                    <h3 className="text-xl font-black text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
