@'
const db = require("../config/database");

async function saveFile(data) {
    const sql = `
        INSERT INTO user_files
        (user_id, folder_id, original_name, saved_name, file_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
        data.user_id || null,
        data.folder_id || null,
        data.original_name,
        data.saved_name,
        data.file_type,
        data.file_size
    ]);
    return result.insertId;
}

async function getFiles(folderId) {
    const sql = folderId
        ? "SELECT * FROM user_files WHERE folder_id = ? ORDER BY created_at DESC"
        : "SELECT * FROM user_files WHERE folder_id IS NULL ORDER BY created_at DESC";
    const [rows] = folderId ? await db.query(sql, [folderId]) : await db.query(sql);
    return rows;
}

async function getFileById(id) {
    const [rows] = await db.query("SELECT * FROM user_files WHERE id = ?", [id]);
    return rows[0];
}

async function deleteFile(id) {
    const [result] = await db.query("DELETE FROM user_files WHERE id = ?", [id]);
    return result.affectedRows;
}

async function renameFile(id, newName) {
    const [result] = await db.query(
        "UPDATE user_files SET original_name = ? WHERE id = ?",
        [newName, id]
    );
    return result.affectedRows;
}

async function searchFiles(query) {
    const [rows] = await db.query(
        "SELECT * FROM user_files WHERE original_name LIKE ? ORDER BY created_at DESC",
        [`%${query}%`]
    );
    return rows;
}

async function createFolder(name, parentId) {
    const [result] = await db.query(
        "INSERT INTO user_folders (name, parent_id) VALUES (?, ?)",
        [name, parentId || null]
    );
    return result.insertId;
}

async function getFolders(parentId) {
    const sql = parentId
        ? "SELECT * FROM user_folders WHERE parent_id = ? ORDER BY name ASC"
        : "SELECT * FROM user_folders WHERE parent_id IS NULL ORDER BY name ASC";
    const [rows] = parentId ? await db.query(sql, [parentId]) : await db.query(sql);
    return rows;
}

async function getFolderById(id) {
    const [rows] = await db.query("SELECT * FROM user_folders WHERE id = ?", [id]);
    return rows[0];
}

async function deleteFolder(id) {
    const [result] = await db.query("DELETE FROM user_folders WHERE id = ?", [id]);
    return result.affectedRows;
}

async function renameFolder(id, newName) {
    const [result] = await db.query(
        "UPDATE user_folders SET name = ? WHERE id = ?",
        [newName, id]
    );
    return result.affectedRows;
}

module.exports = {
    saveFile,
    getFiles,
    getFileById,
    deleteFile,
    renameFile,
    searchFiles,
    createFolder,
    getFolders,
    getFolderById,
    deleteFolder,
    renameFolder
};
'@ | Out-File -FilePath "C:\Users\sp833\mark01\AI HUB\backend\models\fileModel.js" -Encoding utf8