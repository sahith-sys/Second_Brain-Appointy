const ogs = require("open-graph-scraper");
const axios = require("axios");
const cheerio = require("cheerio");

async function extractMetadata(url) {
  try {
    const metadata = {
      url,
      title: null,
      description: null,
      image: null,
      price: null,
      author: null,
      siteName: null,
      type: null,
    };

    // Try Open Graph scraping first
    try {
      const { result } = await ogs({ url });

      if (result.success) {
        metadata.title = result.ogTitle || result.twitterTitle;
        metadata.description = result.ogDescription || result.twitterDescription;
        metadata.image = result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url;
        metadata.siteName = result.ogSiteName;
        metadata.type = result.ogType;
      }
    } catch (ogError) {
      console.log("Open Graph scraping failed, trying custom scraping");
    }

    // Custom scraping for specific sites
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // If OG didn't work, try standard HTML tags
      if (!metadata.title) {
        metadata.title = $("title").text() || $('meta[name="title"]').attr("content");
      }
      if (!metadata.description) {
        metadata.description = $('meta[name="description"]').attr("content");
      }

      // YouTube-specific
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        metadata.type = "video";
        const videoId = extractYouTubeID(url);
        if (videoId) {
          metadata.image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      // Amazon-specific
      if (url.includes("amazon.com") || url.includes("amazon.")) {
        metadata.type = "product";

        // Try to extract price
        const priceWhole = $("#priceblock_ourprice, .a-price-whole, #priceblock_dealprice").first().text().trim();
        const priceFraction = $(".a-price-fraction").first().text().trim();

        if (priceWhole) {
          metadata.price = `${priceWhole}${priceFraction || ""}`;
        }

        // Alternative price selectors
        if (!metadata.price) {
          const altPrice = $('span[class*="price"]').first().text().trim();
          if (altPrice && altPrice.includes("$")) {
            metadata.price = altPrice;
          }
        }
      }

      // Flipkart-specific
      if (url.includes("flipkart.com")) {
        metadata.type = "product";
        const price = $("._30jeq3, ._1_WHN1").first().text().trim();
        if (price) {
          metadata.price = price;
        }
      }

      // General article detection
      if (!metadata.type) {
        const articleTag = $("article").length > 0;
        const blogPost = $('meta[property="article:published_time"]').length > 0;

        if (articleTag || blogPost) {
          metadata.type = "article";
          metadata.author = $('meta[name="author"]').attr("content") ||
                          $('meta[property="article:author"]').attr("content");
        }
      }

    } catch (scrapingError) {
      console.error("Custom scraping failed:", scrapingError.message);
    }

    // Clean up metadata
    if (metadata.title) metadata.title = metadata.title.trim().substring(0, 500);
    if (metadata.description) metadata.description = metadata.description.trim().substring(0, 1000);

    return metadata;
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return null;
  }
}

function extractYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

module.exports = { extractMetadata, extractYouTubeID };
