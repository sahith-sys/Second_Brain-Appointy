const axios = require('axios');
require('dotenv').config();

/**
 * Embedding Service using Gemini via LiteLLM
 * Generates vector embeddings for semantic search
 */

const LITELLM_BASE_URL = process.env.ANTHROPIC_BASE_URL;
const API_KEY = process.env.ANTHROPY_API_KEY;
const EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Generate embeddings for text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      console.warn('Empty text provided for embedding');
      return null;
    }

    // Truncate very long text to avoid API limits
    const maxLength = 8000; // Gemini embedding limit
    const truncatedText = text.length > maxLength
      ? text.substring(0, maxLength)
      : text;

    console.log(`Generating embedding for text (${truncatedText.length} chars)`);

    const response = await axios.post(
      `${LITELLM_BASE_URL}/v1/embeddings`,
      {
        model: EMBEDDING_MODEL,
        input: truncatedText,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      const embedding = response.data.data[0].embedding;
      console.log(`✅ Generated embedding: ${embedding.length} dimensions`);
      return embedding;
    }

    throw new Error('Invalid response format from embedding API');

  } catch (error) {
    console.error('Error generating embedding:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    return null;
  }
}

/**
 * Generate embedding for an item
 * Combines title, content, and tags for comprehensive embedding
 * @param {Object} item - Item object with title, content, tags
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateItemEmbedding(item) {
  try {
    // Combine title, content, tags, and OCR text into searchable text
    const textParts = [];

    if (item.title) textParts.push(item.title);
    if (item.content) textParts.push(item.content);
    if (item.tags && item.tags.length > 0) {
      textParts.push(`Tags: ${item.tags.join(', ')}`);
    }
    if (item.metadata && item.metadata.summary) {
      textParts.push(item.metadata.summary);
    }
    if (item.ocrText) {
      textParts.push(`Image Text: ${item.ocrText}`);
    }

    const combinedText = textParts.join('\n\n');

    if (!combinedText.trim()) {
      console.warn('No text content to embed for item');
      return null;
    }

    return await generateEmbedding(combinedText);

  } catch (error) {
    console.error('Error generating item embedding:', error.message);
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

module.exports = {
  generateEmbedding,
  generateItemEmbedding,
  cosineSimilarity,
};
