const Item = require("../models/Item");
const { detectType } = require("../utils/parser");
const { extractMetadata, extractYouTubeID } = require("../utils/metadataExtractor");

exports.createItem = async (req, res) => {
  try {
    const { title, content, url, tags = [], userId = "default_user", imageUrl, type } = req.body;

    let itemData = { title, content, url, tags, userId, imageUrl };
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
    const { title, content, url, tags, type, imageUrl } = req.body;

    const item = await Item.findByIdAndUpdate(
      id,
      { title, content, url, tags, type, imageUrl },
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

    res.json({
      message: "File uploaded successfully",
      imageUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: "Error uploading file", error: err.message });
  }
};
