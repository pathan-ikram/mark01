const { extractText } = require("../services/textExtractor");
const { analyzeDocument } = require("../services/aiAnalysis");
const documentModel = require("../models/documentModel");

exports.uploadDocument = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        console.log("Extracting text...");
console.log("req.file =", req.file);

if (!req.file) {
    return res.status(400).json({
        success: false,
        message: "No file uploaded"
    });
}

console.log("Path:", req.file.path);
console.log("Original:", req.file.originalname);


        const text = await extractText(req.file.path, req.file.originalname);

        if (!text || text.trim().length === 0) {
            return res.status(422).json({
                success: false,
                message: "Could not extract any text from this file"
            });
        }

        console.log("Text extracted:", text.substring(0, 300));

        const analysis = await analyzeDocument(text, req.file.originalname);

        await documentModel.saveDocument({
            user_id: null,
            original_name: req.file.originalname,
            saved_name: req.file.filename,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            extracted_text: text,
            analysis
        });

        res.json({
            success: true,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            analysis
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

exports.getHistory = async (req, res) => {

    try {

        const documents = await documentModel.getAllDocuments();

        res.json({
            success: true,
            documents
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getDocumentDetail = async (req, res) => {

    try {

        const doc = await documentModel.getDocumentById(req.params.id);

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
                analysis: JSON.parse(doc.analysis)
            }
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};