const express = require('express');
const { scrapeWebsite } = require('./scrapeUtils');
const websiteConfigs = require('./websiteConfigs');

const app = express();
const port = process.env.PORT || 3000;

let scrapedData = {}; // Store scraped data for all websites

// Function to scrape all websites
async function scrapeAllWebsites() {
  try {
    const websites = Object.keys(websiteConfigs);
    for (const website of websites) {
      console.log(`Scraping ${website}...`);
      scrapedData[website] = await scrapeWebsite(
        websiteConfigs[website].url,
        websiteConfigs[website].selectors
      );
    }
  } catch (err) {
    console.error("Error during scraping all websites:", err);
    throw err;
  }
}

// Automatically scrape every 7 days (604800000 milliseconds)
setInterval(() => {
  console.log("Triggering automatic scraping for all websites...");
  scrapeAllWebsites().catch((err) => console.error("Automatic scraping failed:", err));
}, 604800000);

// API route to get mixed data from all sources
app.get('/scrape', async (req, res) => {
  try {
    if (Object.keys(scrapedData).length === 0) {
      console.log("No data found, scraping now...");
      await scrapeAllWebsites();
    }
    res.json(scrapedData); // Return scraped data as JSON
  } catch (error) {
    console.error("Error in /scrape route:", error);
    res.status(500).json({ error: 'An error occurred during scraping' });
  }
});

// Start the Express server
app.listen(port, '::', () => {
  console.log(`Server running on port ${port}`);
});