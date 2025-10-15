const db = require("../config/db");

const getAllUsers = (callback) => {
  db.query(
    "SELECT * FROM taiKhoan WHERE trangThai = 'Active'",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const deleteUser = (id, callback) => {
  db.query(
    "DELETE FROM taiKhoan WHERE maTaiKhoan = ?",
    [id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const addUser = (user, callback) => {
  const { tenDangNhap, matKhau, capDo } = user;

  const ngayTao = new Date().toISOString().slice(0, 10);
  const trangThai = "Active";
  db.query(
    "INSERT INTO taiKhoan (tenDangNhap, matKhau, ngayTao, capDo, trangThai) VALUES (?, ?, ?, ?, ?)",
    [tenDangNhap, matKhau, ngayTao, capDo, trangThai],
    (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
      }
      callback(err, results);
    }
  );
};

const updateUser = (id, user, callback) => {
  const { tenDangNhap, matKhau, capDo, trangThai } = user;

  db.query(
    "UPDATE taiKhoan SET tenDangNhap = ?, matKhau = ?, capDo = ?, trangThai = ? WHERE maTaiKhoan = ?",
    [tenDangNhap, matKhau, capDo, trangThai, id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const blockUser = (id, callback) => {
  db.query(
    "UPDATE taiKhoan SET trangThai = 'Khóa' WHERE maTaiKhoan = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("💥 Lỗi SQL khi xóa:");
        console.error("- Code:", err.code);
        console.error("- Message:", err.sqlMessage);
      } else {
        console.log("✅ Xóa thành công từ database:");
        console.log("- Affected rows:", results.affectedRows);
      }
      callback(err, results);
    }
  );
};
const unblockUser = (id, callback) => {
  db.query(
    "UPDATE taiKhoan SET trangThai = 'Active' WHERE maTaiKhoan = ?",
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
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
  blockUser,
  unblockUser,
};
