const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    url: String,
    type: {
      type: String,
      enum: ["note", "article", "product", "todo", "video", "image", "other"],
      default: "other",
    },
    tags: [String],
    metadata: {
      description: String,
      image: String,
      price: String,
      author: String,
      siteName: String,
      ogType: String,
      videoId: String,
    },
    imageUrl: String,
    userId: String,
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Item", itemSchema);
