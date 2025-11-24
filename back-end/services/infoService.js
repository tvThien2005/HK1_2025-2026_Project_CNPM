const db = require("../config/db");

// Lấy học sinh của phụ huynh
exports.getParentStudents = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        hs.maHocSinh,
        hs.tenHocSinh,
        hs.lop,
        hs.anhHocSinh
      FROM
        phuHuynh ph
      JOIN
        hocSinh hs ON ph.maHocSinh = hs.maHocSinh
      WHERE
        ph.maTaiKhoan = ?
    `;

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getParentStudents:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy thông tin tài khoản phụ huynh
exports.getParentInfo = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tk.maTaiKhoan,
             tk.tenDangNhap,
             tk.matKhau,
             tk.capDo,
             tk.trangThai,
             tk.ngayTao AS createdAt,
             ph.tenPhuHuynh AS fullName,
             ph.soDienThoai AS phone,
             ph.ngaySinh AS dob
      FROM taiKhoan tk
      LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
      WHERE tk.maTaiKhoan = ? LIMIT 1
    `;

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getParentInfo:", err);
        reject(err);
      } else {
        resolve(results[0] || null);
      }
    });
  });
};

// Cập nhật thông tin tài khoản phụ huynh
exports.updateParentInfo = (maTaiKhoan, fullName, phone, dob, tenDangNhap, password) => {
  return new Promise((resolve, reject) => {
    // Bắt đầu transaction
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      // UPDATE bảng phuhuynh
      const updatePhuHuynhQuery = `
        UPDATE phuHuynh 
        SET tenPhuHuynh = ?, soDienThoai = ?, ngaySinh = ?
        WHERE maTaiKhoan = ?
      `;

      db.query(updatePhuHuynhQuery, [fullName, phone, dob, maTaiKhoan], (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Lỗi update phuHuynh:", err);
            reject(err);
          });
        }

        // UPDATE bảng taikhoan
        const updateTaiKhoanQuery = `
          UPDATE taiKhoan 
          SET tenDangNhap = ?, matKhau = ?
          WHERE maTaiKhoan = ?
        `;

        db.query(updateTaiKhoanQuery, [tenDangNhap, password, maTaiKhoan], (err, results) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Lỗi update taiKhoan:", err);
              reject(err);
            });
          }

          // Commit transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }
            resolve({ success: true, message: "Cập nhật thông tin thành công" });
          });
        });
      });
    });
  });
};

// Lấy lịch sử đi học
exports.getStudyHistory = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT lt.ngay, hs.tenHocSinh, lt.thoiGianDi AS morning, lt.thoiGianDen AS afternoon
      FROM taiKhoan tk
      JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
      JOIN hocSinh hs ON ph.maHocSinh = hs.maHocSinh
      JOIN phanBoHocSinhTram pbhst ON hs.maHocSinh = pbhst.maHocSinh
      JOIN phanBoTramXe pbtx ON pbhst.maDiemDung = pbtx.maDiemDung
      JOIN chuyenXe cx ON pbtx.maChuyenXe = cx.maChuyenXe
      JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      WHERE tk.maTaiKhoan = ?
      ORDER BY lt.ngay DESC
    `;

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getStudyHistory:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Tạo thông báo đón học sinh
exports.createPickupNotification = (maHocSinh, maChuyenXe, tenHocSinh, tenTaiXe, bienSoXe) => {
  return new Promise((resolve, reject) => {
    // Bắt đầu transaction
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      // Lấy mã phụ huynh từ học sinh
      const getPhuHuynhQuery = 'SELECT maPhuHuynh FROM phuHuynh WHERE maHocSinh = ?';
      
      db.query(getPhuHuynhQuery, [maHocSinh], (err, phuHuynhResults) => {
        if (err) {
          return db.rollback(() => {
            reject(err);
          });
        }

        if (phuHuynhResults.length === 0) {
          return db.rollback(() => {
            reject(new Error('Không tìm thấy phụ huynh'));
          });
        }

        const maPhuHuynh = phuHuynhResults[0].maPhuHuynh;

        // Tạo thông báo
        const createThongBaoQuery = `
          INSERT INTO thongBao (maQuanLyXe, noiDung, thoiGianTao) 
          VALUES (?, ?, NOW())
        `;

        const noiDung = `Học sinh ${tenHocSinh} đã được xe ${bienSoXe} (tài xế ${tenTaiXe}) đón thành công`;

        db.query(createThongBaoQuery, [1, noiDung], (err, thongBaoResults) => {
          if (err) {
            return db.rollback(() => {
              reject(err);
            });
          }

          const maThongBao = thongBaoResults.insertId;

          // Gán thông báo cho phụ huynh
          const assignThongBaoQuery = `
            INSERT INTO chiTietThongBao (maThongBao, maTaiKhoan) 
            VALUES (?, ?)
          `;

          db.query(assignThongBaoQuery, [maThongBao, maPhuHuynh], (err, results) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  reject(err);
                });
              }
              resolve({ success: true, message: 'Thông báo đã được gửi' });
            });
          });
        });
      });
    });
  });
};