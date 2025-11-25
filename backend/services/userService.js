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
const checkUsernameExists = (username, callback) => {
  db.query(
    "SELECT COUNT(*) AS count FROM taiKhoan WHERE tenDangNhap = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi khi kiểm tra username tồn tại:", err);
        return callback(err);
      }
      callback(null, results[0].count > 0);
    }
  );
};

const addUser = (user, callback) => {
  const { tenDangNhap, matKhau, capDo, hoTen, selectedStudent } = user;

  // 1️⃣ Kiểm tra username trước khi thêm
  checkUsernameExists(tenDangNhap, (err, exists) => {
    if (err) {
      console.error("❌ Lỗi khi kiểm tra username trước khi thêm:", err);
      return callback(err);
    }

    if (exists) {
      return callback(null, { exists: true });
    }

    // 2️⃣ Nếu không tồn tại → thêm mới
    const now = new Date();
    const ngayTao =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const trangThai = "Active";
    const tinhTrang = "1";

    db.query(
      "INSERT INTO taiKhoan (tenDangNhap, matKhau, ngayTao, capDo, trangThai, tinhTrang) VALUES (?, ?, ?, ?, ?, ?)",
      [tenDangNhap, matKhau, ngayTao, capDo, trangThai, tinhTrang],
      (err, results) => {
        if (err) return callback(err);

        const userId = results.insertId;

        if (capDo === "Manager") {
          // Thêm vào bảng quanLyXe nếu là Manager
          db.query(
            "INSERT INTO quanLyXe (tenQuanLyXe, soDienThoai, ngaySinh, trangThai, maTaiKhoan) VALUES (?, ?, ?, ?, ?)",
            [hoTen, tenDangNhap, matKhau, trangThai, userId],
            (err2, results2) => {
              if (err2) return callback(err2);
              callback(null, { taiKhoan: results, quanLyXe: results2 });
            }
          );
        } else if (capDo === "Parent") {
          // Thêm vào bảng phuHuynh nếu là Parent
          db.query(
            "INSERT INTO phuHuynh (tenPhuHuynh, soDienThoai, ngaySinh, maTaiKhoan, maHocSinh,trangThai) VALUES (?, ?, ?, ?, ?, ?)",
            [hoTen, tenDangNhap, matKhau, userId, selectedStudent, trangThai],
            (err2, results2) => {
              if (err2) return callback(err2);
              callback(null, { taiKhoan: results, phuHuynh: results2 });
            }
          );
        } else {
          callback(null, { taiKhoan: results });
        }
      }
    );
  });
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

// Đăng nhập - kiểm tra tài khoản
const loginUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM taiKhoan WHERE tenDangNhap = ? AND matKhau = ? AND trangThai = 'Active' AND tinhTrang = 1 AND capDo = 'Manager'",
      [username, password],
      (err, results) => {
        if (err) {
          console.error("❌ Lỗi truy vấn đăng nhập:", err);
          return reject(err);
        }

        if (results.length === 0) {
          console.log("❌ Không tìm thấy user:", username, password);
          return reject(new Error("Tên đăng nhập hoặc mật khẩu không đúng"));
        }

        const user = results[0];
        resolve({
          maTaiKhoan: user.maTaiKhoan,
          tenDangNhap: user.tenDangNhap,
          capDo: user.capDo,
          trangThai: user.trangThai,
        });
      }
    );
  });
};

module.exports = {
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
  blockUser,
  unblockUser,
  loginUser,
  checkUsernameExists,
};
