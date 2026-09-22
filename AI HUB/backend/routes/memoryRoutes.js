const express = require("express");
const router = express.Router();

const memoryController = require("../controllers/memoryController");

router.post("/add", memoryController.addMemory);
router.get("/session/:sessionId", memoryController.getSessionMemory);
router.delete("/session/:sessionId", memoryController.clearSessionMemory);
router.get("/document/:id", memoryController.getDocumentMemory);
router.get("/document-search", memoryController.searchDocumentMemory);

module.exports = router;