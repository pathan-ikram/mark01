require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 5
});

const promisePool = pool.promise();

// Test connection immediately when this file loads
promisePool.getConnection()
    .then((connection) => {
        console.log(`✅ MySQL connected successfully (database: ${process.env.DB_NAME})`);
        connection.release();
    })
    .catch((err) => {
        console.error("❌ MySQL connection failed:", err.message);
    });

module.exports = promisePool;