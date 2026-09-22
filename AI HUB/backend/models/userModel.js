const db = require("../config/database");

// Find user by email
async function findByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows[0];
}

// Find user by username
async function findByUsername(username) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    return rows[0];
}

// Find user by ID
async function findById(id) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
    );
    return rows[0];
}

// Create new user
async function createUser(user) {
    const {
        fullname,
        username,
        email,
        password,
        phone,
        country
    } = user;

    const [result] = await db.query(
        `INSERT INTO users
        (fullname, username, email, password, phone, country)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            fullname,
            username,
            email,
            password,
            phone,
            country
        ]
    );

    return result.insertId;
}

module.exports = {
    findByEmail,
    findByUsername,
    findById,
    createUser
};