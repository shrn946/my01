const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const DEMOS = [
  {
    url: "https://clinics-lime.vercel.app/eye-4/",
    filename: "eye-clinic-demo-4.png"
  }
];

const OUTPUT_DIR = path.join(__dirname, "public", "demo-screenshots");

async function captureScreenshot(browser, url, filename) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  console.log(`📸 Capturing: ${url}`);

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    // Wait extra for animations/lazy-loaded content
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: outputPath,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });

    console.log(`  ✅ Saved: ${filename} (${Math.round(fs.statSync(outputPath).size / 1024)} KB)`);
  } catch (err) {
    console.error(`  ❌ Failed: ${url} — ${err.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  for (const demo of DEMOS) {
    await captureScreenshot(browser, demo.url, demo.filename);
  }

  await browser.close();
  console.log("\n✅ All screenshots done!");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
