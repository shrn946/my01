const cheerio = require('cheerio');
async function test() {
  try {
    const res = await fetch('https://www.yelp.com/biz/reliable-auto-and-diesel-repair-antioch-3', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Check JSON-LD
    let bizData = null;
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const data = JSON.parse($(el).html());
            console.log('@type:', data['@type']);
            if (data.name) bizData = data;
        } catch(e) {}
    });
    console.log('JSON-LD Data:', JSON.stringify(bizData, null, 2));

  } catch (e) {
    console.error(e);
  }
}
test();