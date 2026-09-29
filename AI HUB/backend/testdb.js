console.log("Starting database test...");

const db = require("./config/database");

async function testConnection() {
  try {
    const [rows] = await db.query("SELECT * FROM users");

    console.log("âœ… Database Connected!");
    console.table(rows);
  } catch (err) {
    console.error("âŒ Database Error:");
    console.error(err);
  }
}

testConnection();


