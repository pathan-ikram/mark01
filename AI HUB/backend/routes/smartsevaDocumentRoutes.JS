const express = require("express");
const router = express.Router();

const controller = require("../controllers/smartsevaDocumentController");

router.post("/", controller.createDocument);
router.get("/", controller.getDocuments);
router.patch("/:id/status", controller.updateStatus);
router.delete("/:id", controller.deleteDocument);

module.exports = router;