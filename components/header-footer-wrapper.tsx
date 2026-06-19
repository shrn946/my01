"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function HeaderFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer on report and proposal pages
  const isReportPage = pathname?.startsWith("/report/") || pathname?.startsWith("/proposal/");

  return (
    <>
      {!isReportPage && <SiteHeader />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isReportPage && <SiteFooter />}
    </>
  );
}
