"use client";

import { useEffect, useRef } from "react";
import { trackReportViewAction } from "@/app/dashboard/actions";

export function ReportViewTracker({ leadId }: { leadId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    
    // Very basic bot detection
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|preview/i.test(
      navigator.userAgent
    );

    if (isBot) return;

    tracked.current = true;

    trackReportViewAction(leadId).catch((e) => console.error("Failed to track view", e));
  }, [leadId]);

  return null;
}
