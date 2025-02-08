// const puppeteer = require('puppeteer');

// async function scrapeRedditPopular() {
//   let browser;
//   try {
//     console.log('Launching Puppeteer...');
//     browser = await puppeteer.launch({
//       headless: true,
//       protocolTimeout: 300000, // Increased timeout to 5 minutes
//     });
//     const page = await browser.newPage();

//     // Set user-agent and headers
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-US,en;q=0.9',
//     });

//     console.log('Navigating to https://www.reddit.com/r/popular/...');
//     await page.goto('https://www.reddit.com/r/popular/', { 
//       waitUntil: 'networkidle2', 
//       timeout: 60000 
//     });

//     // Wait for initial content to load
//     await page.waitForSelector('shreddit-post', { timeout: 30000 });

//     console.log('Scrolling to load more posts...');
//     const posts = await autoScrollAndCollectPosts(page);

//     console.log('Total posts scraped:', posts.length);
//     await browser.close();
//     return posts;
//   } catch (error) {
//     console.error('Error during Reddit scraping:', error);
//     if (browser) await browser.close();
//     throw error;
//   }
// }

// async function autoScrollAndCollectPosts(page) {
//   return await page.evaluate(async () => {
//     const postsData = new Set();
//     const maxScrollAttempts = 20;
//     let scrollAttempts = 0;
//     let lastPostCount = 0;

//     const scrollAndCollect = () => {
//       return new Promise((resolve) => {
//         const scrollInterval = setInterval(() => {
//           // Scroll to bottom
//           window.scrollTo(0, document.body.scrollHeight);

//           // Collect posts
//           const postElements = document.querySelectorAll('shreddit-post');
//           postElements.forEach((post) => {
//             // Use a combination of attributes to create a unique key
//             const postKey = post.getAttribute('id') || post.querySelector('a[slot="title"]')?.innerText.trim();
            
//             if (postKey) {
//               const postData = {
//                 title: post.querySelector('a[slot="title"]')?.innerText.trim() || 'No title',
//                 url: (() => {
//                   const link = post.querySelector('a[slot="full-post-link"]');
//                   return link?.href ? 
//                     (link.href.startsWith('/') ? `https://www.reddit.com${link.href}` : link.href) 
//                     : 'No URL';
//                 })(),
//                 upvotes: post.querySelector('faceplate-number[number][type="upvote"]')?.innerText.trim() || 'No upvotes',
//                 comments: post.querySelector('faceplate-number[number][type="comment"]')?.innerText.trim() || 'No comments',
//                 subreddit: post.querySelector('a[data-testid="subreddit-name"]')?.innerText.trim() || 'No subreddit',
//                 image: post.querySelector('img[alt^="r/"]')?.src || 'No image',
//                 time: post.querySelector('time[datetime]')?.innerText.trim() || 'No time',
//               };

//               // Add to set to ensure unique posts
//               postsData.add(JSON.stringify(postData));
//             }
//           });

//           // Check if new posts have been added
//           if (postsData.size > lastPostCount) {
//             lastPostCount = postsData.size;
//             scrollAttempts = 0;
//           } else {
//             scrollAttempts++;
//           }

//           // Stop conditions
//           if (scrollAttempts >= maxScrollAttempts || postsData.size >= 150) {
//             clearInterval(scrollInterval);
//             resolve(Array.from(postsData).map(JSON.parse));
//           }
//         }, 500); // Wait 500ms between scroll attempts
//       });
//     };

//     return await scrollAndCollect();
//   });
// }

// module.exports = { scrapeRedditPopular };


const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

async function scrapeRedditPopular(skip = 0, limit = 200) {
  let browser;
  try {
    console.log('Launching Puppeteer...');
    
    // Use chrome-aws-lambda's Chromium
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath, // Using chrome-aws-lambda's Chromium
      headless: chromium.headless,
      protocolTimeout: 300000,
    });

    const page = await browser.newPage();

    // Set user-agent and headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    console.log('Navigating to https://www.reddit.com/r/popular/...');
    await page.goto('https://www.reddit.com/r/popular/', { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    // Wait for initial content to load
    await page.waitForSelector('shreddit-post', { timeout: 30000 });

    console.log('Scrolling to load more posts...');
    const posts = await autoScrollAndCollectPosts(page);

    console.log('Total posts scraped:', posts.length);

    // Apply skip and limit
    const paginatedPosts = posts.slice(skip, skip + limit);

    // Count videos and images
    let videoCount = 0;
    let imageCount = 0;
    paginatedPosts.forEach((post) => {
      if (post.video !== 'No video') videoCount++;
      if (post.image !== 'No image') imageCount++;
    });

    console.log(`Posts with videos: ${videoCount}`);
    console.log(`Posts with images: ${imageCount}`);

    await browser.close();

    return {
      status: 'success',
      message: 'Data scraped successfully',
      data: paginatedPosts,
      totalPosts: posts.length,
      postsWithVideos: videoCount,
      postsWithImages: imageCount,
    };
  } catch (error) {
    console.error('Error during Reddit scraping:', error);
    if (browser) await browser.close();

    return {
      status: 'error',
      message: 'Failed to scrape data',
      error: error.message,
    };
  }
}

module.exports = { scrapeRedditPopular };
