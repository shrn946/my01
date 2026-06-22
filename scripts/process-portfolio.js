const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const websites = [
  // Healthcare and Wellness
  { url: 'https://changesclinic.ie/', category: 'Healthcare and Wellness', title: 'Changes Clinic' },
  { url: 'https://willowmedspa.com/', category: 'Healthcare and Wellness', title: 'Willow Medspa' },
  { url: 'https://www.zenhealingretreat.com/', category: 'Healthcare and Wellness', title: 'Zen Healing Retreat' },
  { url: 'https://www.cadenceireland.ie/', category: 'Healthcare and Wellness', title: 'Cadence Ireland' },
  { url: 'https://oysha.qodeinteractive.com/', category: 'Healthcare and Wellness', title: 'Oysha' },
  { url: 'https://healingwithzen.com/', category: 'Healthcare and Wellness', title: 'Healing With Zen' },
  { url: 'https://fyregyms.ie/', category: 'Healthcare and Wellness', title: 'Fyre Gyms' },
  { url: 'https://resurs.themerex.net/psychology/', category: 'Healthcare and Wellness', title: 'Resurs Psychology' },

  // Security and Transportation
  { url: 'https://royalamericangroup.com/', category: 'Security and Transportation', title: 'Royal American Group' },
  { url: 'https://www.worldwidelimousines.de/', category: 'Security and Transportation', title: 'Worldwide Limousines' },
  { url: 'https://driveyou.ie/', category: 'Security and Transportation', title: 'Drive You' },
  { url: 'https://sigmaretailpartners.com/', category: 'Security and Transportation', title: 'Sigma Retail Partners' }, // Note: Maybe Retail, but under Security/Transportation in prompt
  { url: 'https://www.wirfahren.de/', category: 'Security and Transportation', title: 'Wir Fahren' },
  { url: 'https://utilitypartners.com/', category: 'Security and Transportation', title: 'Utility Partners' },
  { url: 'https://www.qlimo.com/', category: 'Security and Transportation', title: 'Qlimo' },
  { url: 'https://www.pro-servicesmarketing.com/', category: 'Security and Transportation', title: 'Pro Services Marketing' },
  { url: 'https://transmissiondepot.ca/', category: 'Security and Transportation', title: 'Transmission Depot' },
  { url: 'https://infiniteconsultingempire.com/', category: 'Security and Transportation', title: 'Infinite Consulting Empire' },

  // Moving Services
  { url: 'https://mrkliin.com/', category: 'Moving Services', title: 'Mr Kliin' },
  { url: 'https://communitymove.com/', category: 'Moving Services', title: 'Community Move' },
  { url: 'https://websitedemos.net/moving-services-04/?customize=template', category: 'Moving Services', title: 'Moving Services Demo' },
  { url: 'https://monroemovingpro.com/', category: 'Moving Services', title: 'Monroe Moving Pro' },
  { url: 'https://ammovingcompany.com/', category: 'Moving Services', title: 'AM Moving Company' },
  { url: 'https://demo.templatemonster.com/demo/84082.html', category: 'Moving Services', title: 'Moving Template Monster' },
  { url: 'https://demo.themeignite.com/movers-agency/', category: 'Moving Services', title: 'Movers Agency Demo' },

  // Retail Parks And Shopping
  { url: 'https://sligoretailpark.com/', category: 'Retail Parks And Shopping', title: 'Sligo Retail Park' },
  { url: 'https://waterfordretailpark.ie/', category: 'Retail Parks And Shopping', title: 'Waterford Retail Park' },
  { url: 'https://navanretailpark.ie/', category: 'Retail Parks And Shopping', title: 'Navan Retail Park' },
  { url: 'https://www.thesquare.ie/', category: 'Retail Parks And Shopping', title: 'The Square' },
  { url: 'https://parkwayretail.ie/', category: 'Retail Parks And Shopping', title: 'Parkway Retail' },
  { url: 'https://droghedaretailpark.ie/', category: 'Retail Parks And Shopping', title: 'Drogheda Retail Park' },
  { url: 'https://www.tallaghtstadium.ie/', category: 'Retail Parks And Shopping', title: 'Tallaght Stadium' },
  { url: 'https://www.thesquaremedia.ie/', category: 'Retail Parks And Shopping', title: 'The Square Media' },

  // Educational
  { url: 'https://emuink.ie/', category: 'Educational', title: 'Emu Ink' },
  { url: 'https://abacard.co.za/home/', category: 'Educational', title: 'Abacard' },
  { url: 'https://websitedemos.net/school-02/?customize=template', category: 'Educational', title: 'School Demo 1' },
  { url: 'https://rarathemesdemo.com/education-zone-pro-6/', category: 'Educational', title: 'Education Zone Pro' },

  // Others
  { url: 'https://nugentceilings.ie/', category: 'Others', title: 'Nugent Ceilings' },
  { url: 'https://stonemillpartners.com/', category: 'Others', title: 'Stonemill Partners' },
  { url: 'https://www.nveuromotor.com/', category: 'Others', title: 'NVEuromotor' },
  { url: 'https://crossroadsmissions.com/', category: 'Others', title: 'Crossroads Missions' }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

async function captureAndSeed() {
  console.log('Starting screenshot capture...');
  const publicDir = path.join(__dirname, '..', 'public', 'portfolio-screenshots');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Ensure categories exist in Prisma
  const categories = [...new Set(websites.map(w => w.category))];
  for (const cat of categories) {
    let existing = await prisma.category.findFirst({ where: { name: cat } });
    if (!existing) {
      const slug = slugify(cat);
      try {
        await prisma.category.create({ data: { name: cat, slug } });
        console.log(`Created category: ${cat}`);
      } catch (e) {
        console.log(`Category creation skipped or failed for ${cat}:`, e.message);
      }
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const projectsToSeed = [];

  for (let i = 0; i < websites.length; i++) {
    const site = websites[i];
    const slug = slugify(site.title);
    const filename = `${slug}.jpg`;
    const filepath = path.join(publicDir, filename);
    const imageUrl = `/portfolio-screenshots/${filename}`;

    let categoryId = null;
    try {
      const cat = await prisma.category.findFirst({ where: { name: site.category } });
      if (cat) categoryId = cat.id;
    } catch(e) {}

    projectsToSeed.push({
      title: site.title,
      slug: slug,
      categoryId: categoryId,
      description: `A custom project for ${site.title} in the ${site.category} industry.`,
      overview: `A web project created for ${site.title}.`,
      problem: `Needed a modern website.`,
      solution: `Created a responsive site.`,
      result: `Improved user engagement.`,
      tools: ['WordPress', 'Responsive Design'],
      image: imageUrl,
      gallery: [],
      liveUrl: site.url,
      featured: false
    });

    if (fs.existsSync(filepath)) {
      console.log(`Skipping screenshot for ${site.title}, already exists.`);
      continue;
    }

    const page = await context.newPage();
    console.log(`Capturing [${i+1}/${websites.length}]: ${site.title} (${site.url})`);
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 15000 });
      // Scroll to trigger lazy-loaded elements
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          let distance = 1000;
          let timer = setInterval(() => {
            let scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if(totalHeight >= scrollHeight - window.innerHeight){
              clearInterval(timer);
              window.scrollTo(0, 0); // Scroll back up
              resolve(true);
            }
          }, 200);
        });
      });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: filepath, type: 'jpeg', quality: 80, fullPage: true });
      console.log(`Success: ${site.title}`);
    } catch (error) {
      console.log(`Error capturing ${site.title}: ${error.message}`);
      // Try again with domcontentloaded
      try {
        console.log(`Retrying ${site.title}...`);
        await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.evaluate(async () => {
          await new Promise((resolve) => {
            let totalHeight = 0; let distance = 1000;
            let timer = setInterval(() => {
              let scrollHeight = document.body.scrollHeight; window.scrollBy(0, distance); totalHeight += distance;
              if(totalHeight >= scrollHeight - window.innerHeight){ clearInterval(timer); window.scrollTo(0, 0); resolve(true); }
            }, 200);
          });
        });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: filepath, type: 'jpeg', quality: 80, fullPage: true });
        console.log(`Success (retry): ${site.title}`);
      } catch (e2) {
        console.log(`Failed to capture ${site.title}`);
        // We will just use a placeholder if it completely fails
        // We'll leave the code so it tries.
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('Finished capturing screenshots.');

  console.log('Seeding database...');
  for (const p of projectsToSeed) {
    try {
      const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
      if (!existing && p.categoryId) {
        await prisma.project.create({
          data: {
            title: p.title,
            slug: p.slug,
            description: p.description,
            overview: p.overview,
            problem: p.problem,
            solution: p.solution,
            result: p.result,
            tools: p.tools,
            image: p.image,
            gallery: p.gallery,
            liveUrl: p.liveUrl,
            featured: p.featured,
            categoryId: p.categoryId
          }
        });
        console.log(`Seeded project: ${p.title}`);
      }
    } catch (e) {
      console.error(`Error seeding project ${p.title}:`, e.message);
    }
  }
  
  console.log('Done!');
  await prisma.$disconnect();
}

captureAndSeed().catch(e => {
  console.error(e);
  process.exit(1);
});
