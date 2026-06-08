import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
