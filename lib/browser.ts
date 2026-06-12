import "server-only";

export async function launchBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const [{ default: chromium }, { chromium: playwrightChromium }] =
      await Promise.all([
        import("@sparticuz/chromium"),
        import("playwright-core"),
      ]);

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { chromium: localChromium } = await import("playwright");
  return localChromium.launch({ headless: true });
}
