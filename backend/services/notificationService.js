const db = require("../config/db");

const getAllNotificationsDriver = (callback) => {
  db.query(
    `SELECT t.maTaiXe,t.tenTaiXe,tk.maTaiKhoan,ql.tenQuanLyXe, 
     tb.maThongBao,tb.noiDung,tb.thoiGianTao
     FROM taiXe t
     JOIN taiKhoan tk ON tk.maTaiKhoan = t.maTaiKhoan
     JOIN chiTietThongBao ct ON ct.maTaiKhoan = tk.maTaiKhoan
     JOIN thongBao tb ON tb.maThongBao = ct.maThongBao
     JOIN quanLyXe ql ON ql.maTaiKhoan = tk.maTaiKhoan `,
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};
const getAllNotificationsParent = (callback) => {
  db.query(
    `SELECT p.maPhuHuynh,p.tenPhuHuynh,tk.maTaiKhoan,ql.tenQuanLyXe, 
     tb.maThongBao,tb.noiDung,tb.thoiGianTao
     FROM phuHuynh p
     JOIN taiKhoan tk ON tk.maTaiKhoan = p.maTaiKhoan
     JOIN chiTietThongBao ON chiTietThongBao.maTaiKhoan = tk.maTaiKhoan
     JOIN thongBao tb ON tb.maThongBao = chiTietThongBao.maThongBao
     JOIN quanLyXe ql ON ql.maTaiKhoan = tk.maTaiKhoan `,
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const addNotification = (notification, callback) => {
  const { maTaiKhoan, maQuanLyXe, noiDung } = notification;
  const ngayTao = new Date().toISOString();
  db.query(
    `INSERT INTO thongBao (maQuanLyXe,noiDung,thoiGianTao) VALUES (?,?,?) `,
    [maTaiKhoan, maQuanLyXe, noiDung, ngayTao],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
        return;
      }
      const maThongBao = results.insertId;
      db.query(
        "INSERT INTO chiTietThongBao(maThongBao,maTaiKhoan) VALUES (?,?)",
        [maThongBao, maTaiKhoan],
        (err1, results1) => {
          if (err1) {
            console.error("SQL Error:", err1);
            return callback(err1);
          }
          callback(null, { thongBao: results, chiTietThongBao: results1 });
        }
      );
    }
  );
};

const deleteNotification = (id, callback) => {
  db.query(
    "DELETE FROM chiTietThongBao WHERE maThongBao = ? ",
    [id],
    (err, results) => {
      if (err) {
        console.error("Lỗi không thể xóa bảng chi tiết thông báo");
        return callback(err);
      }
      db.query(
        "DELETE FROM thongBao WHERE maThongBao = ?",
        [id],
        (err1, results1) => {
          if (err1) {
            console.error("lỗi không thể xóa bảng thông báo");
            return callback(err1);
          }
          callback(null, { chiTietThongBao: results, thongBao: results1 });
        }
      );
    }
  );
};

module.exports = {
  getAllNotificationsDriver,
  getAllNotificationsParent,
  addNotification,
  deleteNotification,
};
