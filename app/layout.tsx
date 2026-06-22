import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HeaderFooterWrapper } from "@/components/header-footer-wrapper";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { getMenuSettings } from "@/lib/data";
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
    template: "%s | CoreWebLabs",
    default: "CoreWebLabs - High-Performance Web Solutions",
  },
  description: "CoreWebLabs builds expert WordPress, Next.js, and custom web solutions for modern businesses.",
  openGraph: {
    title: "CoreWebLabs - High-Performance Web Solutions",
    description: "CoreWebLabs builds expert WordPress, Next.js, and custom web solutions for modern businesses.",
    type: "website"
  },
  alternates: {
    canonical: "/"
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const menuItems = await getMenuSettings();
  
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground">
        <ScrollProgressBar />
        <HeaderFooterWrapper menuItems={menuItems}>
          <PageTransition>
            {children}
          </PageTransition>
        </HeaderFooterWrapper>
        <Toaster />
      </body>
    </html>
  );
}
