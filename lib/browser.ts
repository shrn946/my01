import "server-only";

export async function launchBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const [{ default: chromium }, { chromium: playwrightChromium }] =
      await Promise.all([
        import("@sparticuz/chromium-min"),
        import("playwright-core"),
      ]);

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
      headless: true,
    });
  }

  const { chromium: localChromium } = await import("playwright");
  return localChromium.launch({ headless: true });
}
