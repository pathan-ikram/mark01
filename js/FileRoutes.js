@'
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const fileController = require("../controllers/fileController");

router.get("/search", fileController.searchFiles);

router.get("/folders", fileController.listFolders);
router.post("/folders", fileController.createFolder);
router.patch("/folders/:id/rename", fileController.renameFolder);
router.delete("/folders/:id", fileController.deleteFolder);

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/", fileController.listFiles);
router.get("/:id/download", fileController.downloadFile);
router.patch("/:id/rename", fileController.renameFile);
router.delete("/:id", fileController.deleteFile);

module.exports = router;
'@ | Out-File -FilePath "C:\Users\sp833\mark01\AI HUB\backend\routes\fileRoutes.js" -Encoding utf8