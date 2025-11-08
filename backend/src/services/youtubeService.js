const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Fetch transcript for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string|null>} - Transcript text or null if unavailable
 */
async function fetchYoutubeTranscript(videoId) {
  try {
    console.log(`Fetching transcript for video: ${videoId}`);

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      console.log('No transcript available for this video');
      return null;
    }

    // Combine all transcript segments into one text
    const fullTranscript = transcript
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    console.log(`Transcript fetched successfully (${fullTranscript.length} characters)`);
    return fullTranscript;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error.message);
    return null;
  }
}

module.exports = {
  fetchYoutubeTranscript,
};
