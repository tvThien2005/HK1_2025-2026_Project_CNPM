const db = require("../config/db");
const getAllDriver = (callback) => {
  db.query("SELECT * FROM taiXe WHERE trangThai = 'Active'", (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn SQL:", err);
    }
    callback(err, results);
  });
};

const deleteDriver = (id, callback) => {
  db.query(
    "UPDATE taiXe SET trangThai = 'Inactive' WHERE maTaiXe = ?",
    [id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const checkUsernameExists = (soDienThoai, callback) => {
  db.query(
    "SELECT COUNT(*) AS count FROM taiXe WHERE soDienThoai = ?",
    [soDienThoai],
    (err, results) => {
      if (err) return callback(null, false);
      callback(null, results[0].count > 0);
    }
  );
};
const addDriver = (driver, callback) => {
  const { tenTaiXe, anhTaiXe, ngaySinh, soDienThoai, soBangLai } = driver;

  checkUsernameExists(soDienThoai, (err, exists) => {
    if (exists) {
      return callback(null, { exists: true });
    }
    const ngayTao = new Date().toISOString().slice(0, 10);
    const trangThai = "Active";
    const capDo = "Driver";
    const block = 1;
    db.query(
      "INSERT INTO taiKhoan (tenDangNhap, matKhau, ngayTao, capDo, trangThai,block) VALUES (?, ?, ?, ?, ?,?)",
      [soDienThoai, ngaySinh, ngayTao, capDo, trangThai, block],
      (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) {
          return callback(new Error("Tên đăng nhập đã tồn tại"));
        }
        const userId = results.insertId;
        db.query(
          "INSERT INTO taiXe(tenTaiXe,ngaySinh,anhTaiXe,soDienThoai,soBangLai,trangThai,maTaiKhoan) VALUES (?,?,?,?,?,?,?)",
          [
            tenTaiXe,
            ngaySinh,
            anhTaiXe,
            soDienThoai,
            soBangLai,
            trangThai,
            userId,
          ],
          (err2, results2) => {
            if (err2) {
              console.error("SQL Error:", err2);
              return callback(err2);
            }
            callback(null, { taiKhoan: results, taiXe: results2 });
          }
        );
      }
    );
  });
};

const updateDriver = (id, driver, callback) => {
  const { tenTaiXe, anhTaiXe, ngaySinh, soDienThoai, soBangLai } = driver;
  db.query(
    "UPDATE taiXe SET tenTaiXe = ?, ngaySinh = ?, anhTaiXe = ?,soDienThoai = ?,soBangLai = ? WHERE maTaiXe = ?",
    [tenTaiXe, ngaySinh, anhTaiXe, soDienThoai, soBangLai, id],
    (err, results) => {
      if (err) {
        console.error("💥 Lỗi SQL khi cập nhật:");
        console.error("- Code:", err.code);
        console.error("- Message:", err.sqlMessage);
      }
      callback(err, results);
    }
  );
};

module.exports = {
  getAllDriver,
  deleteDriver,
  addDriver,
  updateDriver,
};
