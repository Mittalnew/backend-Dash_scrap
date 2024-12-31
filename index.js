const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;// Use dynamic port for deployment

let scrapedData = []; // Store the scraped data here

// Scraping function
async function scrapeData() {
  try {
    console.log("Launching Puppeteer...");
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
    const url = 'https://www.indiatoday.in/';
    console.log("Navigating to URL:", url);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });

    console.log("Waiting for selectors...");
    await page.waitForSelector('.B1S3_content__wrap__9mSB6');
    await page.waitForSelector('.B1S3_story__shortcont__inicf');
    await page.waitForSelector('.thumb.playIconThumbContainer');

    console.log("Scraping data...");
    const scrapedDataFromPage = await page.evaluate(() => {
      let data = [];
      const headlines = document.querySelectorAll('.B1S3_content__wrap__9mSB6');
      const shortContents = document.querySelectorAll('.B1S3_story__shortcont__inicf');
      const imageContainers = document.querySelectorAll('.thumb.playIconThumbContainer');

      headlines.forEach((headline, index) => {
        const imageElement = imageContainers[index]
          ? imageContainers[index].querySelector('img')
          : null;
        const imageSrc = imageElement ? imageElement.src : 'No image available';
        data.push({
          title: headline.innerText.trim(),
          content: shortContents[index]
            ? shortContents[index].innerText.trim()
            : 'No content available',
          image: imageSrc,
        });
      });

      return data;
    });

    await browser.close();
    console.log("Scraping completed successfully:", scrapedDataFromPage);

    scrapedData = scrapedDataFromPage; // Update global scraped data
  } catch (err) {
    console.error("Error during scraping:", err);
    throw err; // Rethrow the error to be handled by the API
  }
}

// Automatically scrape every 2 hours (7200000 milliseconds)
setInterval(() => {
  console.log("Triggering automatic scraping...");
  scrapeData().catch((err) => console.error("Automatic scraping failed:", err));
}, 7200000); // 2 hours

// API route to get the latest scraped data
app.get('/scrape', async (req, res) => {
  try {
    if (scrapedData.length === 0) {
      console.log("No data found, scraping now...");
      await scrapeData();
    }
    res.json(scrapedData); // Return scraped data as JSON
  } catch (error) {
    console.error("Error in /scrape route:", error);
    res.status(500).json({ error: 'An error occurred during scraping' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
