const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = 3000;

let scrapedData = [];  // Store the scraped data here

// Scraping function
async function scrapeData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://www.indiatoday.in/';
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Wait for the content (update the selector if needed)
  await page.waitForSelector('.B1S3_content__wrap__9mSB6');
  await page.waitForSelector('.B1S3_story__shortcont__inicf');
  await page.waitForSelector('.thumb.playIconThumbContainer');

  const scrapedDataFromPage = await page.evaluate(() => {
    let data = [];
    const headlines = document.querySelectorAll('.B1S3_content__wrap__9mSB6');
    const shortContents = document.querySelectorAll('.B1S3_story__shortcont__inicf');
    const imageContainers = document.querySelectorAll('.thumb.playIconThumbContainer');

    headlines.forEach((headline, index) => {
      const imageElement = imageContainers[index] ? imageContainers[index].querySelector('img') : null;
      const imageSrc = imageElement ? imageElement.src : 'No image available';
      data.push({
        title: headline.innerText.trim(),
        content: shortContents[index] ? shortContents[index].innerText.trim() : 'No content available',
        image: imageSrc
      });
    });

    return data;
  });

  await browser.close();

  // Update global scraped data
  scrapedData = scrapedDataFromPage;
  console.log("Data scraped and updated:", scrapedData);
}

// Automatically scrape every 2 hours (7200000 milliseconds)
setInterval(scrapeData, 7200000); // 2 hours

// API route to get the latest scraped data
app.get('/scrape', async (req, res) => {
  try {
    if (scrapedData.length === 0) {
      await scrapeData();  // Run scrape once when the API is hit if data is empty
    }
    res.json(scrapedData);  // Return scraped data as JSON
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during scraping' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
