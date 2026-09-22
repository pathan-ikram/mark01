const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const documentController = require("../controllers/documentsController");

function handleMulterError(err, req, res, next) {
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
}

router.post(
    "/upload",
    (req, res, next) => {
        console.log("Upload request received");
        console.log("Content-Type:", req.headers["content-type"]);
        next();
    },
    upload.single("document"),
    (req, res, next) => {
        console.log("FILE =", req.file);
        next();
    },
    documentController.uploadDocument,
    handleMulterError
);

router.get("/history", documentController.getHistory);
router.get("/:id", documentController.getDocumentDetail);

module.exports = router;