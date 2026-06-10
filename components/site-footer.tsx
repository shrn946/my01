import Link from "next/link";
import { Globe, Briefcase, Send, Mail, Phone, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { Magnetic } from "./magnetic";

const footerLinks = [
  {
    title: "Services",
    links: [
      { label: "WordPress Dev", href: "/services" },
      { label: "Elementor Design", href: "/services" },
      { label: "WooCommerce", href: "/services" },
      { label: "Speed Optimization", href: "/services" },
    ],
  },
  {
    title: "Navigation",
    links: [
      { label: "My Portfolio", href: "/portfolio" },
      { label: "About Me", href: "/about" },
      { label: "Read Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socialLinks = [
  { icon: Send, href: "#", label: "Twitter" },
  { icon: Globe, href: "#", label: "GitHub" },
  { icon: Briefcase, href: "#", label: "LinkedIn" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/5 bg-white pt-20 pb-10">
      {/* Glossy Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -bottom-24 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[80px]" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid gap-16 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="group flex items-center gap-2 text-2xl font-black tracking-tight text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/20">H</span>
              <span>Hassan<span className="text-primary">WP</span></span>
            </Link>
            
            <p className="mt-8 max-w-sm text-lg leading-relaxed text-slate-600">
              Crafting high-performance WordPress experiences with a focus on speed, security, and conversion.
            </p>
            
            <div className="mt-8 flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-bold text-ink uppercase tracking-wider">Available for new projects</span>
            </div>

            <div className="mt-10 flex gap-4">
              {socialLinks.map((social) => (
                <Magnetic key={social.label}>
                  <a
                    href={social.href}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-black/5 text-slate-600 shadow-sm transition-all hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/20"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
          
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-ink mb-8">{group.title}</h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group flex items-center gap-2 text-slate-600 transition-colors hover:text-primary">
                      <span className="h-px w-0 bg-primary transition-all group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-black/5">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Hassan Naqvi. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <Link href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Terms</Link>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Built with <span className="text-primary">Next.js</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Glossy Texture Overlay */}
      <div className="noise-overlay" />
    </footer>
  );
}
