const smartsevaDocumentModel = require("../models/smartsevaDocumentModel");

exports.createDocument = async (req, res) => {
    try {
        const { service, customerName, mobile } = req.body;

        if (!service || !customerName) {
            return res.status(400).json({
                success: false,
                message: "Service type and customer name are required"
            });
        }

        await smartsevaDocumentModel.saveDocument(req.body);

        res.status(201).json({
            success: true,
            message: "Document saved"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const documents = await smartsevaDocumentModel.getAllDocuments();
        res.json({ success: true, documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        await smartsevaDocumentModel.updateStatus(req.params.id, status);
        res.json({ success: true, message: "Status updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const affected = await smartsevaDocumentModel.deleteDocument(req.params.id);

        if (affected === 0) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.json({ success: true, message: "Document deleted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};