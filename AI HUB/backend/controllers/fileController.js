const path = require("path");
const fs = require("fs");
const fileModel = require("../models/fileModel");

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const folderId = req.body.folder_id || null;
        const id = await fileModel.saveFile({
            user_id: null,
            folder_id: folderId,
            original_name: req.file.originalname,
            saved_name: req.file.filename,
            file_type: req.file.mimetype,
            file_size: req.file.size
        });
        res.status(201).json({
            success: true,
            id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.listFiles = async (req, res) => {
    try {
        const folderId = req.query.folder_id || null;
        const files = await fileModel.getFiles(folderId);
        res.json({ success: true, files });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.searchFiles = async (req, res) => {
    try {
        const q = req.query.q || "";
        if (!q) {
            return res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
        }
        const files = await fileModel.searchFiles(q);
        res.json({ success: true, files });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await fileModel.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: "File not found" });
        }
        const filePath = path.join(__dirname, "..", "uploads", file.saved_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File missing from disk" });
        }
        res.download(filePath, file.original_name);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await fileModel.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: "File not found" });
        }
        const filePath = path.join(__dirname, "..", "uploads", file.saved_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await fileModel.deleteFile(req.params.id);
        res.json({ success: true, message: "File deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "New name is required" });
        }
        const file = await fileModel.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: "File not found" });
        }
        await fileModel.renameFile(req.params.id, name.trim());
        res.json({ success: true, message: "File renamed" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createFolder = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Folder name is required" });
        }
        const id = await fileModel.createFolder(name.trim(), parent_id || null);
        res.status(201).json({ success: true, id, name: name.trim() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.listFolders = async (req, res) => {
    try {
        const parentId = req.query.parent_id || null;
        const folders = await fileModel.getFolders(parentId);
        res.json({ success: true, folders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const affected = await fileModel.deleteFolder(req.params.id);
        if (affected === 0) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }
        res.json({ success: true, message: "Folder deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "New name is required" });
        }
        const folder = await fileModel.getFolderById(req.params.id);
        if (!folder) {
            return res.status(404).json({ success: false, message: "Folder not found" });
        }
        await fileModel.renameFolder(req.params.id, name.trim());
        res.json({ success: true, message: "Folder renamed" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};