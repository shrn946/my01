import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HeaderFooterWrapper } from "@/components/header-footer-wrapper";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
}

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: "Hassan Naqvi - WordPress Developer & Elementor Expert",
    template: "%s | WordPress Developer Portfolio"
  },
  description: "Hassan Naqvi is a freelance WordPress developer for Elementor, WooCommerce, custom plugins, speed optimization, and maintenance.",
  openGraph: {
    title: "Hassan Naqvi - WordPress Developer & Elementor Expert",
    description: "Fast, modern, conversion-focused WordPress websites for businesses and freelancers.",
    type: "website"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground">
        <ScrollProgressBar />
        <HeaderFooterWrapper>
          <PageTransition>
            {children}
          </PageTransition>
        </HeaderFooterWrapper>
        <Toaster />
      </body>
    </html>
  );
}
