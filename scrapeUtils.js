

const puppeteer = require('puppeteer');
const { setTimeout } = require('timers/promises');

const proxies = [
  {
    host: '24.172.82.94',
    port: '53281',
    // Add authentication if needed
    username: 'gihoyep476@nalwan.com',
    password: 'P@ssword123453'
  },
  // Add more proxies...
];

// Function to get a random proxy
function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Function to scrape homepage and extract article links
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
        '--single-process',
      ],
    });

    const page = await browser.newPage();
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log("Waiting for selectors...");
    for (const selector of selectors.waitForSelectors) {
      await page.waitForSelector(selector);
    }

    console.log("Scraping homepage data...");
    const scrapedDataFromPage = await page.evaluate((selectors) => {
      let data = [];
      const headlines = document.querySelectorAll(selectors.headlineSelector);
      const shortContents = document.querySelectorAll(selectors.contentSelector);
      const imageContainers = document.querySelectorAll(selectors.imageSelector);
      const articleLinks = document.querySelectorAll(selectors.articleLinkSelector);
      const commentCounts = document.querySelectorAll(selectors.commentCountSelector); // Scrape comment counts

      headlines.forEach((headline, index) => {
        const imageElement = imageContainers[index]
          ? imageContainers[index].querySelector('img')
          : null;
        const imageSrc = imageElement ? imageElement.src || imageElement.dataset.src : 'No image available';

        const commentCount = commentCounts[index] ? commentCounts[index].innerText.trim() : 'No comments found';

        data.push({
          title: headline.innerText.trim(),
          content: shortContents[index]
            ? shortContents[index].innerText.trim()
            : 'No content available',
          image: imageSrc,
          articleLink: articleLinks[index] ? articleLinks[index].href : 'No link available',
          commentCount, // Add comment count
        });
      });

      return data;
    }, selectors);

    await browser.close();
    console.log(`Scraping completed successfully for ${url}:`, scrapedDataFromPage);

    return scrapedDataFromPage;
  } catch (err) {
    console.error(`Error during scraping ${url}:`, err);
    throw err;
  }
}

// Function to scrape full article content from inner page
async function scrapeArticleContent(articleUrl, articleSelectors) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log(`Navigating to article URL: ${articleUrl}`);
    await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log("Waiting for article selectors...");
    await page.waitForSelector(articleSelectors.h1Selector);

    console.log("Scraping full article content...");
    const articleData = await page.evaluate((articleSelectors) => {
      // Scrape h1, h2, and paragraphs
      const h1 = document.querySelector(articleSelectors.h1Selector)?.innerText.trim() || 'No h1 found';
      const h2 = document.querySelector(articleSelectors.h2Selector)?.innerText.trim() || 'No h2 found';
      const paragraphs = Array.from(document.querySelectorAll(articleSelectors.pSelector)).map(p => p.innerText.trim());

      // Scrape date
      const dateElement = document.querySelector(articleSelectors.dateSelector);
      const date = dateElement ? dateElement.innerText.trim() : 'No date found';

      // Scrape image
      const imageElement = document.querySelector(articleSelectors.imageSelector);
      const image = imageElement ? imageElement.src || imageElement.dataset.src : 'No image found';

      // Scrape likes
      const likesElement = document.querySelector(articleSelectors.likesSelector);
      const likes = likesElement ? likesElement.innerText.trim() : 'No likes found';

      return {
        h1,
        h2,
        paragraphs,
        date,
        image,
        likes,
      };
    }, articleSelectors);

    await browser.close();
    return articleData;
  } catch (err) {
    console.error(`Error during scraping article ${articleUrl}:`, err);
    throw err;
  }
}

module.exports = { scrapeWebsite, scrapeArticleContent };