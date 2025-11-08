function detectType({ url, content }) {
  if (url) {
    if (url.includes("youtube.com")) return "video";
    if (url.includes("amazon") || url.includes("flipkart")) return "product";
    return "article";
  }
  if (content && content.startsWith("-")) return "todo";
  if (content && content.length < 200) return "note";
  return "other";
}

module.exports = { detectType };
