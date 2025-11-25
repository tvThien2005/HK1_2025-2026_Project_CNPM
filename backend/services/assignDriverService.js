const db = require("../config/db");

const getAllDrivers = (callback) => {
  db.query(
    "SELECT maTaiXe, tenTaiXe FROM taiXe WHERE trangThai = 'Hoạt động'",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};
const getAllAssignDrivers = (callback) => {
  db.query(
    `SELECT maChuyenXe, tenTaiXe,bienSoXe,ngay, thoiGianDi, thoiGianDen, tenTuyenDuong,chuyenXe.trangThai FROM chuyenXe
    JOIN taiXe ON chuyenXe.maTaiXe = taiXe.maTaiXe
    JOIN xeBuyt ON chuyenXe.maXeBuyt = xeBuyt.maXeBuyt
    JOIN tuyenDuong ON chuyenXe.maTuyenDuong = tuyenDuong.maTuyenDuong
    JOIN lichTrinh ON chuyenXe.maLichTrinh = lichTrinh.maLichTrinh
    `,
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const getAllBuses = (callback) => {
  db.query(
    "SELECT maXeBuyt, bienSoXe FROM xeBuyt WHERE trangThai = 'Hoạt động'",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const getAllSchedules = (callback) => {
  db.query(
    "SELECT maLichTrinh, ngay, thoiGianDi, thoiGianDen FROM lichTrinh WHERE ngay >= CURDATE()",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const getAllRoutes = (callback) => {
  db.query(
    "SELECT maTuyenDuong, tenTuyenDuong FROM tuyenDuong",
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

const addAssignDriver = (assignDriver, callback) => {
  const { maTaiXe, maXeBuyt, maLichTrinh, maTuyenDuong } = assignDriver;

  checkAllConflicts(assignDriver, (err, conflicts) => {
    if (err) return callback(err, null);

    // Tài xế bị trùng
    if (conflicts.hasDriverConflict) {
      return callback(null, {
        conflict: true,
        message: "Tài xế đã được phân công vào lịch trình này",
      });
    }

    // Xe buýt bị trùng
    if (conflicts.hasBusConflict) {
      return callback(null, {
        conflict: true,
        message: "Xe buýt đã được phân công vào lịch trình này",
      });
    }

    // Nếu OK thì thêm
    const trangThai = "Scheduled";
    db.query(
      "INSERT INTO chuyenXe (maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai) VALUES (?, ?, ?, ?, ?)",
      [maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai],
      (err, results) => {
        callback(err, { success: true, results });
      }
    );
  });
};

const deleteAssignDriver = (id, callback) => {
  db.query(
    "UPDATE chuyenXe SET trangThai = 'Cancel' WHERE maChuyenXe = ?",
    [id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const updateAssignDriver = (id, assignDriverData, callback) => {
  const { maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong } = assignDriverData;
  db.query(
    "UPDATE chuyenXe SET maXeBuyt = ?, maTaiXe = ?, maLichTrinh = ?, maTuyenDuong = ? WHERE maChuyenXe = ?",
    [maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, id],
    (err2, res2) => {
      if (err2) return callback(err2);
      callback(null, res2);
    }
  );
};

// 🔍 KIỂM TRA TRÙNG LỊCH TÀI XẾ
const checkDriverScheduleConflict = (maTaiXe, maLichTrinh, callback) => {
  db.query(
    `SELECT COUNT(*) as count 
     FROM chuyenXe 
     WHERE maTaiXe = ? AND maLichTrinh = ?`,
    [maTaiXe, maLichTrinh],
    (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0].count > 0);
    }
  );
};

// 🔍 KIỂM TRA TRÙNG LỊCH XE BUÝT
const checkBusScheduleConflict = (maXeBuyt, maLichTrinh, callback) => {
  db.query(
    `SELECT COUNT(*) as count 
     FROM chuyenXe 
     WHERE maXeBuyt = ? AND maLichTrinh = ? `,
    [maXeBuyt, maLichTrinh],
    (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0].count > 0);
    }
  );
};

// 🔍 KIỂM TRA TẤT CẢ XUNG ĐỘT
const checkAllConflicts = (assignData, callback) => {
  const { maTaiXe, maXeBuyt, maLichTrinh } = assignData;

  db.query(
    `SELECT 
       COUNT(CASE WHEN maTaiXe = ? AND maLichTrinh = ? AND trangThai = 'Scheduled'  THEN 1 END) as driverConflict,
       COUNT(CASE WHEN maXeBuyt = ? AND maLichTrinh = ? AND trangThai = 'Scheduled' THEN 1 END) as busConflict
     FROM chuyenXe`,
    [maTaiXe, maLichTrinh, maXeBuyt, maLichTrinh],
    (err, results) => {
      if (err) return callback(null, false);

      const conflicts = {
        hasDriverConflict: results[0].driverConflict > 0,
        hasBusConflict: results[0].busConflict > 0,
      };

      callback(null, conflicts);
    }
  );
};

module.exports = {
  getAllDrivers,
  getAllBuses,
  getAllSchedules,
  getAllRoutes,
  getAllAssignDrivers,
  addAssignDriver,
  deleteAssignDriver,
  updateAssignDriver,
  checkDriverScheduleConflict,
  checkBusScheduleConflict,
  checkAllConflicts,
};
