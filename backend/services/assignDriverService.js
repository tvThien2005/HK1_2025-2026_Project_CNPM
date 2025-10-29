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
    `SELECT maChuyenXe, tenTaiXe,bienSoXe,ngay, thoiGianDi, thoiGianDen, tenTuyenDuong FROM chuyenXe
    JOIN taiXe ON chuyenXe.maTaiXe = taiXe.maTaiXe
    JOIN xeBuyt ON chuyenXe.maXeBuyt = xeBuyt.maXeBuyt
    JOIN tuyenDuong ON chuyenXe.maTuyenDuong = tuyenDuong.maTuyenDuong
    JOIN lichTrinh ON chuyenXe.maLichTrinh = lichTrinh.maLichTrinh
    WHERE chuyenXe.trangThai = 'Hoạt động'`,
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
    "SELECT maLichTrinh, ngay, thoiGianDi, thoiGianDen FROM lichTrinh",
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
  const trangThai = "Hoạt động";
  db.query(
    "INSERT INTO chuyenXe ( maXeBuyt,maTaiXe, maLichTrinh, maTuyenDuong, trangThai) VALUES (?, ?, ?, ?, ?)",
    [maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai],
    (err, results) => {
      callback(err, results);
    }
  );
};

const deleteAssignDriver = (id, callback) => {
  db.query(
    "UPDATE chuyenXe SET trangThai = 'Ngừng hoạt động' WHERE maChuyenXe = ?",
    [id],
    (err, results) => {
      callback(err, results);
    }
  );
};

const updateAssignDriver = (id, assignDriver, callback) => {
  const { maTaiXe, maXeBuyt, maLichTrinh, maTuyenDuong } = assignDriver;
  db.query(
    "UPDATE chuyenXe SET  maXeBuyt = ?, maTaiXe = ?, maLichTrinh = ?, maTuyenDuong = ? WHERE maChuyenXe = ?",
    [maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, id],
    (err, results) => {
      callback(err, results);
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
};
