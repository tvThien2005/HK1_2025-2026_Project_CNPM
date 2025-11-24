// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "school_bus_management",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("✅ Kết nối MySQL thành công");
// });

// module.exports = db;

// config/cb.js
// config/database.js
// config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "school_bus_management"
});

// Kết nối database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

module.exports = db;