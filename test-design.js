const { chromium } = require('playwright');
async function crawlDesignData(url) {
  let browser;
  try {
    browser = await chromium.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const analysis = await page.evaluate(() => {
      const getStyles = (el) => window.getComputedStyle(el);
      const bgColors = new Set();
      const allElements = Array.from(document.querySelectorAll('*'));
      allElements.slice(0, 500).forEach(el => {
        const styles = getStyles(el);
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent') {
          bgColors.add(styles.backgroundColor);
        }
      });
      const fonts = new Set();
      allElements.slice(0, 300).forEach(el => {
        const styles = getStyles(el);
        if (styles.fontFamily) fonts.add(styles.fontFamily.split(',')[0].replace(/['"]/g, ''));
      });
      const hasHero = !!document.querySelector('header + section, section:first-of-type, .hero, #hero');
      const hasNavbar = !!document.querySelector('nav, header, .nav, .navbar');
      const hasFooter = !!document.querySelector('footer, .footer, #footer');
      const ctaButtons = document.querySelectorAll('button, .btn, .button, a[class*="btn"], a[class*="button"]').length;
      return {
        colors: { background: Array.from(bgColors).slice(0, 5) },
        fonts: Array.from(fonts).slice(0, 5),
        structure: { hasHero, hasNavbar, hasFooter, ctaCount: ctaButtons }
      };
    });
    console.log(analysis);
    return analysis;
  } catch (e) {
    console.error('Error:', e);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
crawlDesignData('https://example.com');
