// const puppeteer = require('puppeteer');

// async function scrapeTwitterTrends() {
//   let browser;
//   try {
//     // Launch Puppeteer with increased timeout
//     console.log('Launching Puppeteer...');
//     browser = await puppeteer.launch({
//       headless: true,
//       protocolTimeout: 120000, // Increase protocol timeout to 120 seconds
//     });
//     const page = await browser.newPage();

//     // Increase default timeouts
//     page.setDefaultTimeout(120000); // 120 seconds
//     page.setDefaultNavigationTimeout(120000); // 120 seconds

//     // Navigate to Trends24.in
//     console.log('Navigating to https://trends24.in/india/...');
//     await page.goto('https://trends24.in/india/', { waitUntil: 'networkidle2' });

//     // Wait for trends to load
//     console.log('Waiting for trends to load...');
//     await page.waitForSelector('.list-container', { timeout: 120000 });

//     // Scrape trending data
//     console.log('Scraping trending data...');
//     const trends = [];

//     const trendCards = await page.$$('.list-container li');
//     for (let i = 0; i < Math.min(trendCards.length, 50); i++) { // Limit to 50 trends
//       const card = trendCards[i];
//       console.log(`Processing trend card ${i + 1}...`);

//       // Extract trend details
//       const title = await card.$eval('.trend-name a.trend-link', el => el.innerText.trim()).catch(() => 'No title');
//       const tweetsCount = await card.$eval('.tweet-count', el => el.innerText.trim()).catch(() => 'No tweets count');
//       const time = await card.$eval('.title', el => el.innerText.trim()).catch(() => 'No time found');

//       console.log('Trend:', title, 'Tweets:', tweetsCount, 'Time:', time);

//       // Click on the trend to open modal
//       const trendLink = await card.$('.trend-name a.trend-link');
//       if (trendLink) {
//         console.log('Clicking on trend link to open modal...');
//         await trendLink.click();

//         // Wait for modal to open
//         try {
//           await page.waitForSelector('#trendcheck-dialog', { timeout: 5000 });
//           console.log('Modal is open, scraping modal data...');

//           // Scrape modal data
//           const rank = await page.$eval('.tc-stat-block:nth-child(1) .tc-stat-value', el => el.innerText.trim()).catch(() => 'No rank');
//           const bestPosition = await page.$eval('.tc-stat-block:nth-child(2) .tc-stat-value', el => el.innerText.trim()).catch(() => 'No best position');
//           const totalTweets = await page.$eval('.tc-stat-block:nth-child(3) .tc-stat-value', el => el.innerText.trim()).catch(() => 'No total tweets');
//           const trendingFor = await page.$eval('.tc-stat-block:nth-child(4) .tc-stat-value', el => el.innerText.trim()).catch(() => 'No trending for');

//           // Scrape "New" badge
//           const isNew = await page.$eval('.trend-badge.bg-indigo-100', el => el.innerText.trim() === 'New').catch(() => false);

//           // Scrape "View Tweets on X" link
//           const viewTweetsLink = await page.$eval('.tc-footer-btn', el => el.href).catch(() => 'No link available');

//           console.log('Modal Data:', { rank, bestPosition, totalTweets, trendingFor, isNew, viewTweetsLink });

//           // Close modal
//           console.log('Closing modal...');
//           const closeButton = await page.$('.close-modal');
//           if (closeButton) {
//             await closeButton.click();
//             console.log('Modal closed successfully.');
//           } else {
//             console.log('Close button not found, unable to close modal.');
//           }

//           trends.push({
//             title,
//             tweetsCount,
//             time,
//             rank,
//             bestPosition,
//             totalTweets,
//             trendingFor,
//             isNew,
//             viewTweetsLink,
//           });
//         } catch (error) {
//           console.log('Modal did not open, skipping modal scraping...');
//         }
//       } else {
//         console.log('Trend link not found, skipping modal scraping...');
//       }
//     }

//     console.log('Scraped trends:', trends);
//     await browser.close();
//     return trends; // Return all trends with modal data
//   } catch (error) {
//     console.error('Error during Twitter trends scraping:', error);
//     if (browser) await browser.close();
//     throw error;
//   }
// }

// module.exports = { scrapeTwitterTrends };



const puppeteer = require('puppeteer');

async function scrapeTwitterTrends(skip = 0, limit = 100) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 0, // Disable slowMo for faster execution
      protocolTimeout: 60000, // Timeout in 60 seconds for each network request
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000); // Reduced timeout to 30 seconds
    page.setDefaultNavigationTimeout(30000); // Reduced navigation timeout to 30 seconds

    await page.goto('https://trends24.in/india/', { waitUntil: 'networkidle2' });

    // Scrape trends
    await page.waitForSelector('.list-container', { timeout: 30000 });

    const trendCards = await page.$$('.list-container li');
    const totalTrends = trendCards.length;
    const endIndex = Math.min(skip + limit, totalTrends);
    
    const trendsPromises = trendCards.slice(skip, endIndex).map(async (card, i) => {
      let trendData = {}; // Individual trend object
      try {
        const card = trendCards[i];
        trendData = {
          title: await card.$eval('.trend-name a.trend-link', el => el.innerText.trim()).catch(() => 'N/A'),
          tweetsCount: await card.$eval('.tweet-count', el => el.innerText.trim()).catch(() => 'N/A'),
          time: await card.$eval('.title', el => el.innerText.trim()).catch(() => 'N/A'),
        };

        // Scrape modal data if available
        const trendLink = await card.$('.trend-name a.trend-link');
        if (trendLink) {
          await trendLink.click().catch(() => {});
          const modalData = await Promise.race([ 
            page.waitForSelector('#trendcheck-dialog', { timeout: 10000 }).then(async () => ({
              rank: await page.$eval('.tc-stat-block:nth-child(1) .tc-stat-value', el => el.innerText.trim()).catch(() => 'N/A'),
              bestPosition: await page.$eval('.tc-stat-block:nth-child(2) .tc-stat-value', el => el.innerText.trim()).catch(() => 'N/A'),
              totalTweets: await page.$eval('.tc-stat-block:nth-child(3) .tc-stat-value', el => el.innerText.trim()).catch(() => 'N/A'),
              trendingFor: await page.$eval('.tc-stat-block:nth-child(4) .tc-stat-value', el => el.innerText.trim()).catch(() => 'N/A'),
              isNew: await page.$eval('.trend-badge.bg-indigo-100', el => el.innerText.trim() === 'New').catch(() => false),
              viewTweetsLink: await page.$eval('.tc-footer-btn', el => el.href).catch(() => 'N/A'),
            })),
            new Promise(resolve => setTimeout(() => resolve(null), 10000))
          ]);
          if (modalData) {
            trendData = { ...trendData, ...modalData };
          }
          await page.click('.close-modal, .modal-overlay').catch(async () => {
            await page.keyboard.press('Escape');
          });
        }

      } catch (error) {
        console.error(`Error processing trend ${i + 1}:`, error.message);
        trends.push({
          ...trendData,
          error: `Partial data - ${error.message}`
        });
        return trendData; // return even with partial data
      }

      return trendData;
    });

    const trends = await Promise.all(trendsPromises);

    await browser.close();
    return {
      status: 'success',
      message: `Scraped ${trends.length} trends (${totalTrends} available)`,
      data: trends,
      failures: totalTrends - trends.length,
    };

  } catch (error) {
    if (browser) await browser.close();
    return {
      status: 'error',
      message: 'Critical failure',
      error: error.message,
    };
  }
}

module.exports = { scrapeTwitterTrends };
