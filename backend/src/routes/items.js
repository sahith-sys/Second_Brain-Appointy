const express = require("express");
const router = express.Router();
const { createItem, getItems, updateItem, deleteItem, uploadImage } = require("../controllers/itemController");
const upload = require("../config/multer");

router.post("/", createItem);
router.get("/", getItems);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
