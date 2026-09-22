const db = require("../config/database");

async function saveMemory(sessionId, role, message) {
    const sql = `
        INSERT INTO conversation_memory (session_id, role, message)
        VALUES (?, ?, ?)
    `;
    const [result] = await db.query(sql, [sessionId, role, message]);
    return result.insertId;
}

async function getMemory(sessionId, limit = 20) {
    const sql = `
        SELECT role, message, created_at
        FROM conversation_memory
        WHERE session_id = ?
        ORDER BY created_at ASC
        LIMIT ?
    `;
    const [rows] = await db.query(sql, [sessionId, limit]);
    return rows;
}

async function clearMemory(sessionId) {
    const sql = `DELETE FROM conversation_memory WHERE session_id = ?`;
    const [result] = await db.query(sql, [sessionId]);
    return result.affectedRows;
}

async function getDocumentMemory(documentId) {
    const sql = `
        SELECT id, original_name, extracted_text, analysis
        FROM documents
        WHERE id = ?
    `;
    const [rows] = await db.query(sql, [documentId]);
    return rows[0] || null;
}

async function searchDocumentMemory(keyword) {
    const sql = `
        SELECT id, original_name, upload_date
        FROM documents
        WHERE original_name LIKE ? OR extracted_text LIKE ?
        ORDER BY upload_date DESC
        LIMIT 10
    `;
    const likeTerm = `%${keyword}%`;
    const [rows] = await db.query(sql, [likeTerm, likeTerm]);
    return rows;
}

function buildContextFromMemory(memoryRows) {
    return memoryRows
        .map((row) => `${row.role.toUpperCase()}: ${row.message}`)
        .join("\n");
}

module.exports = {
    saveMemory,
    getMemory,
    clearMemory,
    getDocumentMemory,
    searchDocumentMemory,
    buildContextFromMemory
};