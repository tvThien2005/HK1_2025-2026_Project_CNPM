const db = require("../config/db");

const getAllNotificationsDriver = (callback) => {
  db.query(
    `SELECT 
      t.maTaiXe,
      t.tenTaiXe,
      tk.maTaiKhoan,
      tb.maThongBao,
      tb.noiDung,
      tb.thoiGianTao,
      ql.tenQuanLyXe
     FROM taiXe t
     JOIN taiKhoan tk ON tk.maTaiKhoan = t.maTaiKhoan
     JOIN chiTietThongBao ct ON ct.maTaiKhoan = tk.maTaiKhoan
     JOIN thongBao tb ON tb.maThongBao = ct.maThongBao
     LEFT JOIN quanLyXe ql ON ql.maQuanLyXe = tb.maQuanLyXe`, // Sửa JOIN này
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};

const getAllDriver = (callback) => {
  db.query("SELECT maTaiXe, tenTaiXe,maTaiKhoan FROM taiXe", (err, results) => {
    if (err) {
      console.log("Lỗi không thể lấy danh sách tài xế" + err);
    }
    callback(null, results);
  });
};
const getAllParent = (callback) => {
  db.query(
    "SELECT maPhuHuynh, tenPhuHuynh,maTaiKhoan FROM phuHuynh",
    (err, results) => {
      if (err) {
        console.log("Lỗi không thể lấy danh sách Phụ huynh" + err);
      }
      callback(null, results);
    }
  );
};

const getAllNotificationsParent = (callback) => {
  db.query(
    `SELECT 
      p.maPhuHuynh,
      p.tenPhuHuynh,
      tk.maTaiKhoan,
      tb.maThongBao,
      tb.noiDung,
      tb.thoiGianTao,
      ql.tenQuanLyXe
     FROM phuHuynh p
     JOIN taiKhoan tk ON tk.maTaiKhoan = p.maTaiKhoan
     JOIN chiTietThongBao ct ON ct.maTaiKhoan = tk.maTaiKhoan
     JOIN thongBao tb ON tb.maThongBao = ct.maThongBao
     LEFT JOIN quanLyXe ql ON ql.maQuanLyXe = tb.maQuanLyXe`, // Sửa JOIN này
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};

const addNotification = (notification, callback) => {
  const { maQuanLyXe, noiDung, maTaiKhoan } = notification;
  const thoiGianTao = new Date().toISOString().slice(0, 19).replace("T", " ");

  console.log("📝 Thêm thông báo:", {
    maQuanLyXe,
    noiDung,
    thoiGianTao,
    maTaiKhoan,
  });

  if (!maQuanLyXe || !noiDung || !maTaiKhoan) {
    const errorMsg =
      "Thiếu thông tin bắt buộc: " +
      (!maQuanLyXe ? "maQuanLyXe " : "") +
      (!noiDung ? "noiDung " : "") +
      (!maTaiKhoan ? "maTaiKhoan" : "");
    console.error("❌", errorMsg);
    return callback(new Error(errorMsg));
  }

  const recipients = Array.isArray(maTaiKhoan) ? maTaiKhoan : [maTaiKhoan];
  console.log("👥 Danh sách người nhận:", recipients);

  if (recipients.length === 0) {
    console.log("⚠️ Không có người nhận nào");
    return callback(new Error("Không có người nhận nào"));
  }

  // Bắt đầu transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Lỗi bắt đầu transaction:", err);
      return callback(err);
    }

    // 1. Thêm thông báo
    db.query(
      `INSERT INTO thongBao (maQuanLyXe, noiDung, thoiGianTao) VALUES (?, ?, ?)`,
      [maQuanLyXe, noiDung, thoiGianTao],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Lỗi thêm thông báo:", err);
            callback(err);
          });
        }

        const maThongBao = results.insertId;
        console.log("✅ Đã thêm thông báo, mã:", maThongBao);

        // 2. Thêm chi tiết thông báo
        const placeholders = recipients.map(() => "(?, ?)").join(", ");
        const values = recipients.flatMap((recipient) => [
          maThongBao,
          recipient,
        ]);

        recipients.forEach((recipient) => {
          values.push(maThongBao, recipient);
        });

        const sql = `INSERT INTO chiTietThongBao (maThongBao, maTaiKhoan) VALUES ${placeholders}`;

        console.log("🔍 SQL:", sql);
        console.log("🔍 Values:", values);

        // Thực hiện thêm chi tiết thông báo
        db.query(sql, values, (err1, results1) => {
          if (err1) {
            return db.rollback(() => {
              console.error("❌ Lỗi thêm chi tiết thông báo:", err1);
              callback(err1);
            });
          }

          // Commit transaction nếu mọi thứ OK
          db.commit((err2) => {
            if (err2) {
              return db.rollback(() => {
                console.error("❌ Lỗi commit transaction:", err2);
                callback(err2);
              });
            }

            console.log(`✅ Đã thêm ${recipients.length} chi tiết thông báo`);
            callback(null, {
              thongBao: results,
              chiTietThongBao: results1,
              maThongBao: maThongBao,
              soNguoiNhan: recipients.length,
            });
          });
        });
      }
    );
  });
};

const deleteNotification = (id, callback) => {
  console.log("🗑️ Xóa thông báo mã:", id);

  // Xóa chi tiết thông báo trước
  db.query(
    "DELETE FROM chiTietThongBao WHERE maThongBao = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi xóa chi tiết thông báo:", err);
        return callback(err);
      }

      console.log("✅ Đã xóa chi tiết thông báo");

      // Xóa thông báo chính
      db.query(
        "DELETE FROM thongBao WHERE maThongBao = ?",
        [id],
        (err1, results1) => {
          if (err1) {
            console.error("❌ Lỗi xóa thông báo:", err1);
            return callback(err1);
          }

          console.log("✅ Đã xóa thông báo");
          callback(null, {
            chiTietThongBao: results,
            thongBao: results1,
          });
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
  getAllDriver,
  getAllParent,
};
