const db = require("../config/database");

async function saveDocument(data) {
    const sql = `
        INSERT INTO smartseva_documents
        (id, service, customer_name, mobile, aadhaar, father_name, caste, address,
         fee, ref_no, notes, submitted_date, expected_date, expected_days, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.id,
        data.service,
        data.customerName,
        data.mobile,
        data.aadhaar || null,
        data.father || null,
        data.caste || null,
        data.address || null,
        data.fee || 0,
        data.ref || null,
        data.notes || null,
        data.submittedDate,
        data.expectedDate,
        data.expectedDays,
        data.status || "Processing"
    ];

    await db.query(sql, values);
    return data.id;
}

async function getAllDocuments() {
    const [rows] = await db.query(
        "SELECT * FROM smartseva_documents ORDER BY created_at DESC"
    );
    return rows;
}

async function updateStatus(id, status) {
    const doneAt = status === "Done" ? new Date() : null;
    await db.query(
        "UPDATE smartseva_documents SET status = ?, done_at = ? WHERE id = ?",
        [status, doneAt, id]
    );
}

async function deleteDocument(id) {
    const [result] = await db.query(
        "DELETE FROM smartseva_documents WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}

module.exports = {
    saveDocument,
    getAllDocuments,
    updateStatus,
    deleteDocument
};