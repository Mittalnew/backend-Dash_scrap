const puppeteer = require('puppeteer');

// Generic scraping function
async function scrapeWebsite(url, selectors) {
  try {
    console.log(`Launching Puppeteer for ${url}...`);
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280x1024',
      ],
    });

    const page = await browser.newPage();
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log("Waiting for selectors...");
    for (const selector of selectors.waitForSelectors) {
      await page.waitForSelector(selector);
    }

    console.log("Scraping data...");
    const scrapedDataFromPage = await page.evaluate((selectors) => {
      let data = [];
      const headlines = document.querySelectorAll(selectors.headlineSelector);
      const shortContents = document.querySelectorAll(selectors.contentSelector);
      const imageContainers = document.querySelectorAll(selectors.imageSelector);

      headlines.forEach((headline, index) => {
        const imageElement = imageContainers[index]
          ? imageContainers[index].querySelector('img')
          : null;
        const imageSrc = imageElement ? imageElement.src || imageElement.dataset.src : 'No image available';

        data.push({
          title: headline.innerText.trim(),
          content: shortContents[index]
            ? shortContents[index].innerText.trim()
            : 'No content available',
          image: imageSrc,
        });
      });

      return data;
    }, selectors);

    await browser.close();
    console.log(`Scraping completed successfully for ${url}:`, scrapedDataFromPage);

    return scrapedDataFromPage;
  } catch (err) {
    console.error(`Error during scraping ${url}:`, err);
    throw err; // Rethrow the error to be handled by the API
  }
}

module.exports = { scrapeWebsite };