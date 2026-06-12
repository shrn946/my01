import "server-only";

import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

export async function launchBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { chromium: localChromium } = await import("playwright");
  return localChromium.launch({ headless: true });
}
