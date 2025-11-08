const Item = require("../models/Item");
const { detectType } = require("../utils/parser");
const { extractMetadata, extractYouTubeID } = require("../utils/metadataExtractor");
const { parseSearchQuery, buildMongoQuery } = require("../services/queryParserService");
const { generateItemEmbedding, generateEmbedding, cosineSimilarity } = require("../services/embeddingService");
const { processUploadedImage } = require("../services/ocrService");
const path = require("path");

exports.createItem = async (req, res) => {
  try {
    const { title, content, url, tags = [], userId = "default_user", imageUrl, type, ocrText } = req.body;

    let itemData = { title, content, url, tags, userId, imageUrl, ocrText };
    let metadata = {};

    // If type is explicitly provided (like 'note' from clipboard), use it and skip metadata extraction
    if (type) {
      itemData.type = type;
    }
    // Only extract metadata if URL is provided and type is not already set
    else if (url) {
      const extractedMetadata = await extractMetadata(url);

      if (extractedMetadata) {
        // Use extracted metadata to fill in missing fields
        if (!title && extractedMetadata.title) {
          itemData.title = extractedMetadata.title;
        }
        if (!content && extractedMetadata.description) {
          itemData.content = extractedMetadata.description;
        }

        // Store rich metadata
        metadata = {
          description: extractedMetadata.description,
          image: extractedMetadata.image,
          price: extractedMetadata.price,
          author: extractedMetadata.author,
          siteName: extractedMetadata.siteName,
          ogType: extractedMetadata.type,
          transcript: extractedMetadata.transcript,
          summary: extractedMetadata.summary,
        };

        // For YouTube videos, extract video ID
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          metadata.videoId = extractYouTubeID(url);
        }

        // Use extracted type if available
        if (extractedMetadata.type) {
          itemData.type = extractedMetadata.type;
        }
      }
    }

    // Fallback to basic type detection if no type was determined
    if (!itemData.type) {
      itemData.type = detectType({ url, content });
    }

    itemData.metadata = metadata;

    const item = new Item(itemData);
    await item.save();

    // Generate embedding asynchronously (don't wait for it)
    generateItemEmbedding(item).then(async (embedding) => {
      if (embedding) {
        item.embedding = embedding;
        await item.save();
        console.log(`✅ Embedding generated for item: ${item._id}`);
      }
    }).catch(err => console.error('Error generating embedding:', err));

    res.status(201).json({ message: "Item saved successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Error saving item", error: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { q, type } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (q) filter.$text = { $search: q };

    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json({ message: "Fetched items", items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, url, tags, type, imageUrl, ocrText } = req.body;

    const item = await Item.findByIdAndUpdate(
      id,
      { title, content, url, tags, type, imageUrl, ocrText },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const imagePath = path.join(__dirname, '../../uploads', req.file.filename);

    // Process OCR and get extracted text
    let ocrText = '';
    try {
      const ocrResult = await processUploadedImage(imagePath);
      ocrText = ocrResult.extractedText || '';
      console.log(`✅ OCR completed for ${req.file.filename}: ${ocrResult.textLength} characters extracted`);
    } catch (err) {
      console.error('OCR error:', err);
    }

    res.json({
      message: "File uploaded successfully",
      imageUrl,
      filename: req.file.filename,
      ocrText: ocrText,
      ocrProcessed: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Error uploading file", error: err.message });
  }
};

exports.intelligentSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log(`Intelligent search query: "${query}"`);

    // Parse natural language query using Claude AI
    const parsedParams = await parseSearchQuery(query);

    // Build MongoDB query from parsed parameters
    const mongoQuery = buildMongoQuery(parsedParams);

    // Execute search
    const items = await Item.find(mongoQuery)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 results

    res.json({
      message: "Search completed",
      query: query,
      parsedParams: parsedParams,
      count: items.length,
      items: items
    });

  } catch (err) {
    console.error('Intelligent search error:', err);
    res.status(500).json({ message: "Error performing search", error: err.message });
  }
};

/**
 * Semantic search using embeddings
 * Finds similar items based on meaning, not just keywords
 */
exports.semanticSearch = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log(`Semantic search query: "${query}"`);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
      return res.status(500).json({
        message: "Failed to generate embedding for query",
        fallback: "Try using the regular search instead"
      });
    }

    // Get all items that have embeddings
    const itemsWithEmbeddings = await Item.find({
      embedding: { $exists: true, $ne: [] }
    });

    if (itemsWithEmbeddings.length === 0) {
      return res.json({
        message: "No items with embeddings found. Items need to be saved first to generate embeddings.",
        query: query,
        count: 0,
        items: []
      });
    }

    // Calculate similarity scores for each item
    const itemsWithScores = itemsWithEmbeddings.map(item => ({
      item: item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // Sort by similarity (highest first) and get top results
    const topResults = itemsWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, parseInt(limit))
      .map(result => ({
        ...result.item.toObject(),
        similarityScore: result.similarity.toFixed(4)
      }));

    res.json({
      message: "Semantic search completed",
      query: query,
      searchType: "semantic",
      count: topResults.length,
      totalItemsSearched: itemsWithEmbeddings.length,
      items: topResults
    });

  } catch (err) {
    console.error('Semantic search error:', err);
    res.status(500).json({ message: "Error performing semantic search", error: err.message });
  }
};
