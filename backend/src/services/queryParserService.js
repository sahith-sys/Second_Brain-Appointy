const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPY_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

/**
 * Parse natural language query into structured search parameters using Claude
 * @param {string} query - Natural language search query
 * @returns {Promise<Object>} - Structured search parameters
 */
async function parseSearchQuery(query) {
  try {
    console.log(`Parsing search query: "${query}"`);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a search query parser for a second brain/knowledge management system. Parse the following natural language search query and extract structured parameters.

Search Query: "${query}"

Extract and return ONLY a valid JSON object with these fields (use null if not mentioned):
{
  "keywords": ["keyword1", "keyword2"],  // Main search terms
  "contentTypes": ["article", "video", "note", "todo", "image"],  // Filter by type (article, video, note, todo, image, product)
  "tags": ["tag1", "tag2"],  // Specific tags mentioned
  "dateRange": {
    "start": "YYYY-MM-DD",  // Calculate from relative dates like "last month", "this week"
    "end": "YYYY-MM-DD"
  },
  "authors": ["author1"],  // Author names if mentioned
  "urls": ["domain.com"],  // Specific domains or URLs
  "intent": "search"  // search, filter, find, or show
}

Important:
- For "last month", calculate the actual date range
- For "this week", use the current week's date range
- For "today", use today's date
- contentTypes should be lowercase: article, video, note, todo, image, product
- Extract keywords intelligently (ignore filler words like "about", "from", "the")
- Return ONLY the JSON object, no explanations

Current date: ${new Date().toISOString().split('T')[0]}`
      }]
    });

    const responseText = message.content[0].text.trim();

    // Extract JSON from response (in case Claude adds any text before/after)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const parsedParams = JSON.parse(jsonMatch[0]);
    console.log('Parsed search parameters:', JSON.stringify(parsedParams, null, 2));

    return parsedParams;

  } catch (error) {
    console.error('Error parsing search query:', error.message);

    // Fallback: return basic keyword search
    // Filter out common filler words
    const fillerWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'all', 'some', 'any', 'this', 'that', 'these', 'those', 'show', 'find', 'get', 'give']);
    const keywords = query.split(' ')
      .filter(word => word.length > 2 && !fillerWords.has(word.toLowerCase()));

    return {
      keywords: keywords.length > 0 ? keywords : query.split(' ').filter(word => word.length > 0),
      contentTypes: null,
      tags: null,
      dateRange: null,
      authors: null,
      urls: null,
      intent: 'search'
    };
  }
}

/**
 * Build MongoDB query from parsed parameters
 * @param {Object} params - Parsed search parameters
 * @returns {Object} - MongoDB query object
 */
function buildMongoQuery(params) {
  const query = {};
  const conditions = [];

  // Keywords search (search in title, content, url, tags)
  if (params.keywords && params.keywords.length > 0) {
    const keywordConditions = params.keywords.map(keyword => ({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { url: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ]
    }));

    conditions.push({ $and: keywordConditions });
  }

  // Content types filter
  if (params.contentTypes && params.contentTypes.length > 0) {
    query.type = { $in: params.contentTypes };
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    query.tags = { $in: params.tags };
  }

  // Date range filter
  if (params.dateRange) {
    const dateFilter = {};

    if (params.dateRange.start) {
      dateFilter.$gte = new Date(params.dateRange.start);
    }

    if (params.dateRange.end) {
      // Set end date to end of day
      const endDate = new Date(params.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = endDate;
    }

    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }
  }

  // Author filter (search in metadata.author)
  if (params.authors && params.authors.length > 0) {
    query['metadata.author'] = { $in: params.authors };
  }

  // URL/domain filter
  if (params.urls && params.urls.length > 0) {
    const urlConditions = params.urls.map(urlPattern => ({
      url: { $regex: urlPattern, $options: 'i' }
    }));
    conditions.push({ $or: urlConditions });
  }

  // Combine all conditions
  if (conditions.length > 0) {
    query.$and = conditions;
  }

  console.log('MongoDB query:', JSON.stringify(query, null, 2));
  return query;
}

module.exports = {
  parseSearchQuery,
  buildMongoQuery,
};
