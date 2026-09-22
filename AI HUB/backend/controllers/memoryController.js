const memoryService = require("../services/memoryService");

exports.addMemory = async (req, res) => {
    try {
        const { sessionId, role, message } = req.body;

        if (!sessionId || !role || !message) {
            return res.status(400).json({
                success: false,
                message: "sessionId, role, and message are required"
            });
        }

        const id = await memoryService.saveMemory(sessionId, role, message);

        res.json({
            success: true,
            id
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getSessionMemory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const memory = await memoryService.getMemory(sessionId, limit);

        res.json({
            success: true,
            sessionId,
            memory
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.clearSessionMemory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const deletedCount = await memoryService.clearMemory(sessionId);

        res.json({
            success: true,
            deletedCount
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getDocumentMemory = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await memoryService.getDocumentMemory(id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        res.json({
            success: true,
            document: {
                ...doc,
                analysis: doc.analysis ? JSON.parse(doc.analysis) : null
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.searchDocumentMemory = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "keyword query param is required"
            });
        }

        const results = await memoryService.searchDocumentMemory(keyword);

        res.json({
            success: true,
            results
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};