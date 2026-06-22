const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to freelancer profile...");
  await page.goto('https://www.freelancer.com/u/wordpressexp01', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  console.log("Waiting for reviews to load...");
  // Sometimes elements take a moment
  await page.waitForTimeout(5000);
  
  const reviews = await page.$$eval('fl-card.PageProject-card', cards => {
    return cards.map(card => {
      const titleEl = card.querySelector('app-project-title h3');
      const textEl = card.querySelector('app-project-description p');
      const ratingEl = card.querySelector('app-rating .Rating-value');
      const clientEl = card.querySelector('app-user-info span');
      
      // Let's try more generic selectors if those don't exist
      const genericTitle = card.querySelector('h2, h3, .ProjectTitle')?.innerText || '';
      const genericText = card.querySelector('p, .Review-description')?.innerText || '';
      // Try to find rating stars or rating text
      const genericRatingText = card.querySelector('fl-rating, [name="star"]')?.parentNode?.innerText || '5.0';
      const genericClient = card.querySelector('.ReviewerInfo-username, .user-name')?.innerText || 'Anonymous Client';

      return {
        title: genericTitle.trim(),
        text: genericText.trim(),
        ratingText: genericRatingText.trim(),
        client: genericClient.trim()
      };
    });
  });

  console.log("Found review cards:", reviews.length);
  
  if (reviews.length === 0) {
    // try taking a screenshot to see what's wrong
    await page.screenshot({ path: 'freelancer-debug.png' });
    console.log("Saved freelancer-debug.png");
  }

  for (let r of reviews) {
    if (!r.title && !r.text) continue;
    
    const text = r.text || r.title || 'Great working experience.';
    const rating = parseFloat(r.ratingText.replace(/[^0-9.]/g, '')) || 5;

    console.log(`Inserting review from ${r.client}: ${text.substring(0, 50)}...`);

    await prisma.review.create({
      data: {
        client: r.client || 'Freelancer Client',
        company: 'Freelancer',
        country: 'Unknown',
        rating: rating,
        text: text,
        platform: 'Freelancer',
        service: r.title || 'WordPress Development',
        active: true
      }
    });
  }

  console.log("Done inserting reviews.");
  await browser.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
