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
    "UPDATE taiKhoan SET trangThai = 'Inactive' WHERE maTaiKhoan = ?",
    [id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const addUser = (user, callback) => {
  const { tenDangNhap, matKhau, capDo, hoTen } = user;

  const ngayTao = new Date().toISOString().slice(0, 10);
  const trangThai = "Active";
  const tinhTrang = "mở khóa";
  db.query(
    "INSERT INTO taiKhoan (tenDangNhap, matKhau, ngayTao, capDo, trangThai,tinhTrang) VALUES (?, ?, ?, ?, ?,?)",
    [tenDangNhap, matKhau, ngayTao, capDo, trangThai, tinhTrang],
    (err, results) => {
      if (err) return callback(err);
      if (results.length > 0) {
        return callback(new Error("Tên đăng nhập đã tồn tại"));
      }
      const userId = results.insertId;
      db.query(
        "INSERT INTO quanLyXe(tenQuanLyXe,soDienThoai,ngaySinh,trangThai,maTaiKhoan) VALUES (?, ?,?,?,?)",
        [hoTen, tenDangNhap, matKhau, trangThai, userId],
        (err2, results2) => {
          if (err2) {
            console.error("SQL Error:", err2);
            return callback(err2);
          }
          callback(null, { taiKhoan: results, quanLyXe: results2 });
        }
      );
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
    "UPDATE taiKhoan SET tinhTrang = 0 WHERE maTaiKhoan = ?",
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
    "UPDATE taiKhoan SET tinhTrang = 1 WHERE maTaiKhoan = ?",
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
