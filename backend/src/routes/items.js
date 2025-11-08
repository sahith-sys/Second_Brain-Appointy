const express = require("express");
const router = express.Router();
const { createItem, getItems, updateItem, deleteItem, uploadImage, intelligentSearch, semanticSearch } = require("../controllers/itemController");
const upload = require("../config/multer");

router.post("/", createItem);
router.get("/", getItems);
router.get("/search", intelligentSearch); // Natural language search endpoint
router.get("/semantic-search", semanticSearch); // Semantic search using embeddings
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
