const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "quanlyxebus",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Kết nối MySQL thành công");
});

module.exports = db;