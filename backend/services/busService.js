const db = require("../config/db");

const getAllBuses = (callback) => {
  db.query(
    "SELECT * FROM xeBuyt WHERE trangThai = 'Active'",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const getBusById = (id, callback) => {
  db.query("SELECT * FROM xeBuyt WHERE maXeBuyt = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn SQL:", err);
    }
    callback(err, results[0] || null);
  });
};

const addBus = (bus, callback) => {
  const { bienSoXe, sucChua, mauXe, trangThai = "Active" } = bus;
  db.query(
    "INSERT INTO xeBuyt (bienSoXe, sucChua, mauXe, trangThai) VALUES (?, ?, ?, ?)",
    [bienSoXe, sucChua, mauXe, trangThai],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
      }
      callback(err, results);
    }
  );
};

const updateBus = (id, bus, callback) => {
  const { bienSoXe, sucChua, mauXe, trangThai } = bus;
  db.query(
    "UPDATE xeBuyt SET bienSoXe = ?, sucChua = ?, mauXe = ?, trangThai = ? WHERE maXeBuyt = ?",
    [bienSoXe, sucChua, mauXe, trangThai, id],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const deleteBus = (id, callback) => {
  db.query("DELETE FROM xeBuyt WHERE maXeBuyt = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi xóa bản ghi:", err);
    }
    callback(err, results);
  });
};

const blockBus = (id, callback) => {
  db.query(
    "UPDATE xeBuyt SET trangThai = 'Inactive' WHERE maXeBuyt = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("💥 Lỗi SQL khi khóa xe:", err);
      }
      callback(err, results);
    }
  );
};

const unblockBus = (id, callback) => {
  db.query(
    "UPDATE xeBuyt SET trangThai = 'Active' WHERE maXeBuyt = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

module.exports = {
  getAllBuses,
  getBusById,
  addBus,
  updateBus,
  deleteBus,
  blockBus,
  unblockBus,
};
