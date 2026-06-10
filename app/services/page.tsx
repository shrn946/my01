import type { Metadata } from "next";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { FadeIn } from "@/components/fade-in";
import { services } from "@/lib/seed-data";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Hassan Naqvi offers WordPress, Elementor, WooCommerce, custom plugin, speed optimization, bug fixing, maintenance, and landing page services."
};

export default function ServicesPage() {
  return (
    <>
      <InnerHero title="Our Services" breadcrumbs={[{ label: "Services" }]} />
      
      <section className="section !py-12 lg:!py-24">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Expertise" 
            title="WordPress services tailored for your growth" 
            text="I provide end-to-end WordPress solutions designed to improve performance, boost conversions, and simplify management." 
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
      <section className="section bg-ink text-white">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Workflow" 
            title="How I deliver success" 
          />
          
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your goals, audience, and technical needs." },
              { step: "02", title: "Strategy", desc: "Crafting a custom roadmap and design system." },
              { step: "03", title: "Execution", desc: "Building your solution with precision and care." },
              { step: "04", title: "Launch", desc: "Rigorous testing and a seamless deployment." },
            ].map((item, index) => (
              <FadeIn key={item.step} delay={index * 0.1} className="relative">
                <div className="text-5xl font-black text-primary/20">{item.step}</div>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
