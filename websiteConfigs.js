// Modular Approach ----- when file code is separet for more readability and imidiate action inn eay way with one place

module.exports = {
    indiaToday: {
      url: 'https://www.indiatoday.in/',
      selectors: {
        waitForSelectors: ['.B1S3_content__wrap__9mSB6', '.B1S3_story__shortcont__inicf', '.thumb.playIconThumbContainer'],
        headlineSelector: '.B1S3_content__wrap__9mSB6',
        contentSelector: '.B1S3_story__shortcont__inicf',
        imageSelector: '.thumb.playIconThumbContainer',
      },
    },
    hindustanTimes: {
      url: 'https://www.hindustantimes.com/',
      selectors: {
        waitForSelectors: ['.hdg3', '.sortDec', 'figure'],
        headlineSelector: '.hdg3',
        contentSelector: '.sortDec',
        imageSelector: 'figure',
      },
    },
    // firstpost: {
    //     url: 'https://www.firstpost.com/',
    //     selectors: {
    //       waitForSelectors: ['h1.literatafont', '.art-content p', '.cp_image_hyperlink img'],
    //       headlineSelector: 'h1.literatafont',
    //       contentSelector: '.art-content p',
    //       imageSelector: '.cp_image_hyperlink img',
    //     },
    //   },
    // Add more websites here
  };