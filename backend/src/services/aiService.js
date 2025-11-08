const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPY_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

/**
 * Generate a summary of YouTube video transcript using Claude
 * @param {string} transcript - The video transcript
 * @param {string} videoTitle - The video title
 * @returns {Promise<string|null>} - Summary text or null if failed
 */
async function generateVideoSummary(transcript, videoTitle) {
  try {
    console.log(`Generating summary for: ${videoTitle}`);

    // If transcript is too long, truncate it (Claude has token limits)
    const maxLength = 50000; // ~12k tokens
    const truncatedTranscript = transcript.length > maxLength
      ? transcript.substring(0, maxLength) + '...'
      : transcript;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Please provide a comprehensive summary of this YouTube video transcript. Include:
1. Main topic/theme
2. Key points (3-5 bullet points)
3. Important insights or takeaways
4. Any action items or conclusions

Video Title: ${videoTitle}

Transcript:
${truncatedTranscript}

Provide the summary in a clear, structured format.`
      }]
    });

    const summary = message.content[0].text;
    console.log(`Summary generated successfully (${summary.length} characters)`);
    return summary;

  } catch (error) {
    console.error('Error generating summary with Claude:', error.message);
    return null;
  }
}

/**
 * Generate search embeddings for text (for future semantic search)
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<Array|null>} - Embedding vector or null
 */
async function generateEmbeddings(text) {
  // Placeholder for future implementation
  // Will use OpenAI embeddings API or similar
  return null;
}

module.exports = {
  generateVideoSummary,
  generateEmbeddings,
};
