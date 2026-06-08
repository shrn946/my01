import Link from "next/link";
import { Globe, Briefcase, Send, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = [
  {
    title: "Project",
    links: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Services", href: "/services" },
      { label: "Reviews", href: "/reviews" },
      { label: "Case Studies", href: "/portfolio" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Me", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Admin", href: "/admin" },
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
    <footer className="border-t border-black/5 bg-slate-50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-black tracking-tight text-ink">
              Hassan<span className="text-primary">WP</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-600">
              Expert WordPress developer specializing in high-performance websites, custom Elementor designs, and WooCommerce optimization. Helping businesses scale with modern web solutions.
            </p>
            <div className="mt-8 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-primary hover:text-white hover:shadow-lg"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-bold text-ink">{group.title}</h3>
              <ul className="mt-6 space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-600 transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-black/5 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Hassan Naqvi. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <Link href="#" className="text-xs text-slate-400 hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
