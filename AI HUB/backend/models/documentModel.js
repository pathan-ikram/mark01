const db = require("../config/database");

async function saveDocument(data) {
    const sql = `
        INSERT INTO documents
        (user_id, original_name, saved_name, file_type, file_size, extracted_text, analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.user_id,
        data.original_name,
        data.saved_name,
        data.file_type,
        data.file_size,
        data.extracted_text,
        JSON.stringify(data.analysis)
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
}

async function getAllDocuments() {
    const [rows] = await db.query(
        "SELECT id, original_name, saved_name, file_type, file_size, upload_date FROM documents ORDER BY upload_date DESC"
    );
    return rows;
}

async function getDocumentById(id) {
    const [rows] = await db.query(
        "SELECT * FROM documents WHERE id = ?",
        [id]
    );
    return rows[0];
}

module.exports = {
    saveDocument,
    getAllDocuments,
    getDocumentById
};
