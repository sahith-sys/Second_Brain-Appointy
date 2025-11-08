const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * OCR Service using Tesseract.js
 * Extracts text from images for searchability
 */

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imagePath) {
  try {
    console.log(`Starting OCR for: ${imagePath}`);

    const result = await Tesseract.recognize(
      imagePath,
      'eng', // English language
      {
        logger: (m) => {
          // Log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    const extractedText = result.data.text.trim();

    if (extractedText.length > 0) {
      console.log(`✅ Extracted ${extractedText.length} characters from image`);
      console.log(`Preview: ${extractedText.substring(0, 100)}...`);
    } else {
      console.log('⚠️ No text found in image');
    }

    return extractedText;

  } catch (error) {
    console.error('Error extracting text from image:', error.message);
    return '';
  }
}

/**
 * Extract text from multiple images
 * @param {string[]} imagePaths - Array of image paths
 * @returns {Promise<string>} - Combined extracted text
 */
async function extractTextFromImages(imagePaths) {
  try {
    const textPromises = imagePaths.map(imagePath => extractTextFromImage(imagePath));
    const results = await Promise.all(textPromises);

    return results.filter(text => text.length > 0).join('\n\n');
  } catch (error) {
    console.error('Error extracting text from multiple images:', error.message);
    return '';
  }
}

/**
 * Process uploaded image: extract text and return metadata
 * @param {string} imagePath - Path to uploaded image
 * @returns {Promise<Object>} - Metadata with extracted text
 */
async function processUploadedImage(imagePath) {
  try {
    const extractedText = await extractTextFromImage(imagePath);

    return {
      hasText: extractedText.length > 0,
      extractedText: extractedText,
      textLength: extractedText.length,
      processedAt: new Date(),
    };

  } catch (error) {
    console.error('Error processing uploaded image:', error.message);
    return {
      hasText: false,
      extractedText: '',
      textLength: 0,
      error: error.message,
    };
  }
}

module.exports = {
  extractTextFromImage,
  extractTextFromImages,
  processUploadedImage,
};
