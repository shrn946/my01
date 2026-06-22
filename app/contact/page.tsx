import type { Metadata } from "next";
import { Mail, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { InnerHero } from "@/components/inner-hero";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/fade-in";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hire a freelance WordPress developer for Elementor, WooCommerce, plugin development, speed optimization, and maintenance."
};

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hassan@coreweblabs.com";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923226692496";

  return (
    <>
      <InnerHero title="Get In Touch" breadcrumbs={[{ label: "Contact" }]} />
      
      <section className="section !py-12 lg:!py-24">
        <div className="section-container">
          <SectionHeading 
            eyebrow="Contact" 
            title="Let's discuss your next project" 
            text="Whether you have a fully scoped project or just an initial idea, we're here to help you navigate the modern web landscape." 
          />
          
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div className="space-y-8">
              <FadeIn>
                <div className="rounded-[2.5rem] bg-ink p-10 text-white shadow-premium">
                  <h2 className="text-3xl font-black italic text-primary">Ready to scale?</h2>
                  <p className="mt-6 text-lg leading-relaxed text-slate-300">
                    Fill out the form with your project details and we'll get back to you within 24 hours with a personalized strategy.
                  </p>
                  
                  <div className="mt-12 space-y-6">
                    <a 
                      href={`https://wa.me/${whatsapp}`} 
                      target="_blank" 
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <MessageCircle size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp</p>
                          <p className="text-lg font-bold">Chat with us</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </a>

                    <a 
                      href={`mailto:${email}`} 
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</p>
                          <p className="text-lg font-bold">{email}</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </a>

                    <a 
                      href={profile.freelancerUrl} 
                      target="_blank" 
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                          <ExternalLink size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Freelancer</p>
                          <p className="text-lg font-bold">View Profile</p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </a>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="rounded-[2.5rem] border border-black/5 bg-slate-50 p-10">
                  <h3 className="text-xl font-black text-ink">What happens next?</h3>
                  <ul className="mt-8 space-y-6">
                    {[
                      { step: "1", title: "Review", desc: "I'll review your project details and goals." },
                      { step: "2", title: "Consultation", desc: "We'll have a quick chat to dive deeper." },
                      { step: "3", title: "Proposal", desc: "You'll receive a detailed quote and timeline." },
                    ].map((item) => (
                      <li key={item.step} className="flex gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {item.step}
                        </span>
                        <div>
                          <p className="font-bold text-ink leading-none">{item.title}</p>
                          <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
            
            <FadeIn delay={0.2}>
              <ContactForm />
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
