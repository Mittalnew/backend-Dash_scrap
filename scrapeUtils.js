

// const puppeteer = require('puppeteer');
// const { setTimeout } = require('timers/promises');


// // Function to scrape homepage and extract article links
// async function scrapeWebsite(url, selectors) {
//   try {
//     console.log(`Launching Puppeteer for ${url}...`);
//     const browser = await puppeteer.launch({
//       headless: true,
//     });

//     const page = await browser.newPage();
//     console.log(`Navigating to URL: ${url}`);
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

//     console.log("Waiting for selectors...");
//     for (const selector of selectors.waitForSelectors) {
//       await page.waitForSelector(selector);
//     }

//     console.log("Scraping homepage data...");
//     const scrapedDataFromPage = await page.evaluate((selectors) => {
//       let data = [];
//       const headlines = document.querySelectorAll(selectors.headlineSelector);
//       const shortContents = document.querySelectorAll(selectors.contentSelector);
//       const imageContainers = document.querySelectorAll(selectors.imageSelector);
//       const articleLinks = document.querySelectorAll(selectors.articleLinkSelector);
//       const commentCounts = document.querySelectorAll(selectors.commentCountSelector); // Scrape comment counts

//       headlines.forEach((headline, index) => {
//         const imageElement = imageContainers[index]
//           ? imageContainers[index].querySelector('img')
//           : null;
//         const imageSrc = imageElement ? imageElement.src || imageElement.dataset.src : 'No image available';

//         const commentCount = commentCounts[index] ? commentCounts[index].innerText.trim() : 'No comments found';

//         data.push({
//           title: headline.innerText.trim(),
//           content: shortContents[index]
//             ? shortContents[index].innerText.trim()
//             : 'No content available',
//           image: imageSrc,
//           articleLink: articleLinks[index] ? articleLinks[index].href : 'No link available',
//           commentCount, // Add comment count
//         });
//       });

//       return data;
//     }, selectors);

//     await browser.close();
//     console.log(`Scraping completed successfully for ${url}:`, scrapedDataFromPage);

//     return scrapedDataFromPage;
//   } catch (err) {
//     console.error(`Error during scraping ${url}:`, err);
//     throw err;
//   }
// }

// // Function to scrape full article content from inner page
// async function scrapeArticleContent(articleUrl, articleSelectors) {
//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     console.log(`Navigating to article URL: ${articleUrl}`);
//     await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

//     console.log("Waiting for article selectors...");
//     await page.waitForSelector(articleSelectors.h1Selector);

//     console.log("Scraping full article content...");
//     const articleData = await page.evaluate((articleSelectors) => {
//       // Scrape h1, h2, and paragraphs
//       const h1 = document.querySelector(articleSelectors.h1Selector)?.innerText.trim() || 'No h1 found';
//       const h2 = document.querySelector(articleSelectors.h2Selector)?.innerText.trim() || 'No h2 found';
//       const paragraphs = Array.from(document.querySelectorAll(articleSelectors.pSelector)).map(p => p.innerText.trim());

//       // Scrape date
//       const dateElement = document.querySelector(articleSelectors.dateSelector);
//       const date = dateElement ? dateElement.innerText.trim() : 'No date found';

//       // Scrape image
//       const imageElement = document.querySelector(articleSelectors.imageSelector);
//       const image = imageElement ? imageElement.src || imageElement.dataset.src : 'No image found';

//       // Scrape likes
//       const likesElement = document.querySelector(articleSelectors.likesSelector);
//       const likes = likesElement ? likesElement.innerText.trim() : 'No likes found';

//       return {
//         h1,
//         h2,
//         paragraphs,
//         date,
//         image,
//         likes,
//       };
//     }, articleSelectors);

//     await browser.close();
//     return articleData;
//   } catch (err) {
//     console.error(`Error during scraping article ${articleUrl}:`, err);
//     throw err;
//   }
// }

// module.exports = { scrapeWebsite, scrapeArticleContent };




const puppeteer = require('puppeteer');

// Function to scrape full article content from inner page
async function scrapeArticleContent(articleUrl, articleSelectors) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage',] });
    const page = await browser.newPage();
    console.log(`Navigating to article URL: ${articleUrl}`);

    // Increase timeout for article loading
    await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Timeout increased to 60 seconds

    console.log("Waiting for article selectors...");
    await page.waitForSelector(articleSelectors.h1Selector);

    console.log("Scraping full article content...");
    const articleData = await page.evaluate((articleSelectors) => {
      try {
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
      } catch (err) {
        console.error(`Error scraping article content: ${err.message}`);
        return null; // Return null if error occurs
      }
    }, articleSelectors);

    await browser.close();
    
    if (articleData) {
      return articleData; // Return data only if article was scraped successfully
    } else {
      console.log(`Skipping article ${articleUrl} due to errors during scraping.`);
      return null; // Skip article if data is null
    }

  } catch (err) {
    console.error(`Error during scraping article ${articleUrl}:`, err);
    return null; // Skip article on error
  }
}

// Function to scrape homepage and extract article links
async function scrapeWebsite(url, selectors) {
  try {
    console.log(`Launching Puppeteer for ${url}...`);
    const browser = await puppeteer.launch({
      headless: true,
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
        try {
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
        } catch (err) {
          console.error(`Error scraping post at index ${index}: ${err.message}`);
        }
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

module.exports = { scrapeWebsite, scrapeArticleContent };
