const db = require("../config/db");

const getAllScheduled = (callback) => {
  db.query(
    "SELECT * FROM lichTrinh WHERE ngay <= CURDATE()",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const addScheduled = (scheduled, callback) => {
  const { ngay, thoiGianDi, thoiGianDen } = scheduled;
  db.query(
    "INSERT INTO lichTrinh (ngay, thoiGianDi, thoiGianDen) VALUES (?, ?, ?)",
    [ngay, thoiGianDi, thoiGianDen],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
      }
      callback(err, results);
    }
  );
};

const updateScheduled = (id, scheduled, callback) => {
  const { ngay, thoiGianDi, thoiGianDen } = scheduled;
  db.query(
    "UPDATE lichTrinh SET ngay = ? , thoiGianDi = ? , thoiGianDen = ? WHERE maLichTrinh = ? ",
    [ngay, thoiGianDi, thoiGianDen, id],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
      }
      callback(err, results);
    }
  );
};

module.exports = {
  getAllScheduled,
  addScheduled,
  updateScheduled,
};
