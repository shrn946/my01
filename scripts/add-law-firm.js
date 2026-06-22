const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
  const url = 'https://www.paulweiss.com/';
  const name = 'Paul Weiss';
  const categoryName = 'Law Firms';

  // 1. Ensure category exists
  let slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryName, slug }
    });
    console.log('Created category:', categoryName);
  }

  // 2. Capture screenshot
  console.log('Capturing screenshot for', url);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('Timeout waiting for networkidle, proceeding anyway...');
  }

  const screenshotsDir = path.join(process.cwd(), 'public', 'portfolio-screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const safeTitle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const fileName = `${safeTitle}-${Date.now()}.png`;
  const filePath = path.join(screenshotsDir, fileName);

  await page.screenshot({ path: filePath, fullPage: true, animations: "disabled", scale: "css" });
  await browser.close();

  const publicPath = `/portfolio-screenshots/${fileName}`;
  console.log('Screenshot saved to', publicPath);

  // 3. Create project
  const projectSlug = safeTitle + '-' + crypto.randomBytes(4).toString('hex');
  await prisma.project.create({
    data: {
      title: name,
      slug: projectSlug,
      categoryId: category.id,
      description: `Custom website design and development for ${name}.`,
      overview: `A complete digital transformation for ${name}.`,
      problem: `The client needed a modern, responsive website to showcase their services.`,
      solution: `We built a custom WordPress solution tailored to their specific needs.`,
      result: `Increased engagement and a stronger online presence.`,
      tools: ['WordPress', 'Elementor', 'Custom CSS', 'PHP'],
      image: publicPath,
      gallery: [publicPath],
      liveUrl: url,
      featured: true,
    }
  });

  console.log('Successfully seeded project:', name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
