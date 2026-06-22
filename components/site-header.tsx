"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

import { Magnetic } from "./magnetic";



export function SiteHeader({ menuItems }: { menuItems?: any }) {
  const navItems = menuItems ? menuItems.filter((item: any) => item.visible !== false) : [];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-black/5 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2 text-xl font-black tracking-tight text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110">H</span>
          <span>Hassan<span className="text-primary">WP</span></span>
        </Link>
        
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex">
          {navItems.map((item) => (
            item.children ? (
              <div key={item.label} className="group relative py-2">
                <Link href={item.href} className="relative flex items-center gap-1 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                  {item.label} <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                <div className="absolute left-0 top-[calc(100%-0.5rem)] hidden w-48 flex-col rounded-xl border border-black/5 bg-white p-2 shadow-xl group-hover:flex">
                  {item.children.filter((child: any) => child.visible !== false).map((child: any) => (
                    <Link key={child.href} href={child.href} className="rounded-lg px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link 
                key={item.href} 
                href={item.href} 
                className="relative py-2 transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Magnetic>
            <Link 
              href="/contact" 
              className="hidden rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/25 lg:inline-flex"
            >
              Hire Me
            </Link>
          </Magnetic>
          
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-ink transition-colors hover:bg-slate-200 lg:hidden" 
            onClick={() => setOpen((value) => !value)} 
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-full w-full border-b border-black/5 bg-white/95 p-6 backdrop-blur-lg lg:hidden"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <Link 
                    href={item.href} 
                    onClick={() => setOpen(false)} 
                    className="text-lg font-bold text-slate-800 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-2 flex flex-col gap-2 border-l-2 border-slate-100 pl-4 mt-1">
                      {item.children.filter((child: any) => child.visible !== false).map((child: any) => (
                        <Link 
                          key={child.href} 
                          href={child.href} 
                          onClick={() => setOpen(false)} 
                          className="text-base font-semibold text-slate-600 hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link 
                href="/contact" 
                onClick={() => setOpen(false)}
                className="mt-4 flex h-12 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20"
              >
                Hire Me
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

