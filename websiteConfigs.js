// // Modular Approach ----- when file code is separet for more readability and imidiate action inn eay way with one place

// module.exports = {
//     indiaToday: {
//       url: 'https://www.indiatoday.in/',
//       selectors: {
//         waitForSelectors: ['.B1S3_content__wrap__9mSB6', '.B1S3_story__shortcont__inicf', '.thumb.playIconThumbContainer'],
//         headlineSelector: '.B1S3_content__wrap__9mSB6 h2',
//         contentSelector: '.B1S3_story__shortcont__inicf',
//         imageSelector: '.thumb.playIconThumbContainer',
//       },
//     },
//     hindustanTimes: {
//       url: 'https://www.hindustantimes.com/',
//       selectors: {
//         waitForSelectors: ['.hdg3', '.sortDec', 'figure'],
//         headlineSelector: '.hdg3 a',
//         contentSelector: '.sortDec',
//         imageSelector: 'figure',
//       },
//     },
//     ndtv: {
//       url: 'https://www.ndtv.com/',
//       selectors: {
//         waitForSelectors: ['div[class*="vjl-"]'],
//         headlineSelector: 'h1', 
//         contentSelector: '.sp-descp',
//         imageSelector: 'img' 
//       },
//     }

//   };

module.exports = {
  indiaToday: {
    url: 'https://www.indiatoday.in/',
    selectors: {
      waitForSelectors: ['.B1S3_content__wrap__9mSB6', '.B1S3_story__shortcont__inicf', '.thumb.playIconThumbContainer', '.story__interaction'],
      headlineSelector: '.B1S3_content__wrap__9mSB6 h2',
      contentSelector: '.B1S3_story__shortcont__inicf',
      imageSelector: '.thumb.playIconThumbContainer',
      articleLinkSelector: '.B1S3_content__wrap__9mSB6 a',
      commentCountSelector: '.SocialShare_story__interaction__feJdj .comment .commentCountEle', // Full path to element
    },
    articleSelectors: {
      fullContentSelector: '.Story_story__content__body__qCd5E story__content__body', // Example selector for full content
      h1Selector: 'h1', // Selector for h1
      h2Selector: 'h2', // Selector for h2
      pSelector: 'p', // Selector for p
      dateSelector: '.Story_stryupdates__wdMz_', // Selector for date
      imageSelector: 'img', // Selector for image
      likesSelector: 'likes', // Selector for likes
         
    },
  },

  hindustanTimes: {
    url: 'https://www.hindustantimes.com/',
    selectors: {
      waitForSelectors: ['.hdg3', '.sortDec', 'figure'],
      headlineSelector: '.hdg3 a',
      contentSelector: '.sortDec',
      imageSelector: 'figure',
      articleLinkSelector: '.hdg3 a',
    },
    articleSelectors: {
      fullContentSelector: '.mainContainer',
      h1Selector: 'h1',
      h2Selector: 'h2',
      pSelector: 'p', 
      dateSelector: '.dateTime.secTime.storyPage', 
      imageSelector: 'img', 
      likesSelector: '.likes',
      commentsSelector: '.comments',
    },
  },

  // ndtv: {
  //   url: 'https://www.ndtv.com/',
  //   selectors: {
  //     waitForSelectors: ['.NwsLstPg_wrp'], // Wait for the news listing wrapper
  //     headlineSelector: '.NwsLstPg_hd h2', // Selector for headlines
  //     contentSelector: '.NwsLstPg_desc', // Selector for short content
  //     imageSelector: '.NwsLstPg_img-full', // Selector for images
  //     articleLinkSelector: '.NwsLstPg_a-li a', // Selector for article links
  //   },
  //   articleSelectors: {
  //     fullContentSelector: '.vjl-cnt', // Selector for full content
  //     h1Selector: 'h1', // Selector for h1
  //     h2Selector: 'h2', // Selector for h2
  //     pSelector: 'p', // Selector for p
  //     dateSelector: '.posted-by', // Selector for date
  //     imageSelector: 'img', // Selector for image
  //     likesSelector: '.likes', // Selector for likes (if available)
  //     commentsSelector: '.comments', // Selector for comments (if available)
  //   },
  // },

};