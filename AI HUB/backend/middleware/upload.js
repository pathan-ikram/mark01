const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});


const allowed = [
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".json",
    ".md",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp"
];

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(new Error("Unsupported file type"));
        }
        cb(null, true);
    }
});

module.exports = upload;