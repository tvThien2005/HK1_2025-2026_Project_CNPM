const db = require("../config/db");

// Lấy tất cả dữ liệu cho bản đồ
exports.getAllBusData = async () => {
  try {
    const [
      hocsinh,
      diachi,
      vitrithuc,
      taixe,
      xebuyt,
      chuyenxe,
      lichtrinh,
      tuyenduong,
      phanbohocsinh,
    ] = await Promise.all([
      this.getHocSinh(),
      this.getDiaChi(),
      this.getViTriThuc(),
      this.getTaiXe(),
      this.getXeBuyt(),
      this.getChuyenXe(),
      this.getLichTrinh(),
      this.getTuyenDuong(),
      this.getPhanBoHocSinh(),
    ]);

    return {
      hocsinh,
      diachi,
      vitrithuc,
      taixe,
      xebuyt,
      chuyenxe,
      lichtrinh,
      tuyenduong,
      phanbohocsinh,
    };
  } catch (error) {
    throw new Error(`Lỗi lấy dữ liệu bus: ${error.message}`);
  }
};

// Các hàm lấy dữ liệu từ database
exports.getHocSinh = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM hocsinh", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getHocSinh:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getDiaChi = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM diachi", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getDiaChi:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getViTriThuc = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM vitrithuc", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getViTriThuc:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getTaiXe = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM taixe", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getTaiXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getXeBuyt = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM xebuyt", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getXeBuyt:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getChuyenXe = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM chuyenxe", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getChuyenXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getLichTrinh = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM lichtrinh", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getLichTrinh:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getTuyenDuong = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM tuyenduong", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getTuyenDuong:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getPhanBoHocSinh = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM phanbohocsinh", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoHocSinh:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Cập nhật vị trí xe (cho real-time tracking)
exports.updateBusPosition = (busId, lat, lng, speed) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO vitrichuyenxe (maChuyenXe, maViTriThuc, thoiGianGhiNhan) 
      VALUES (?, ?, NOW())
    `;

    // First, create or get location ID
    const locationQuery = "INSERT INTO vitrithuc (viDo, kinhDo) VALUES (?, ?)";

    db.query(locationQuery, [lat, lng], (err, locationResult) => {
      if (err) {
        console.error("❌ Lỗi tạo vị trí:", err);
        reject(err);
        return;
      }

      const locationId = locationResult.insertId;

      db.query(query, [busId, locationId], (err, result) => {
        if (err) {
          console.error("❌ Lỗi cập nhật vị trí:", err);
          reject(err);
        } else {
          resolve({ busId, lat, lng, speed, timestamp: new Date() });
        }
      });
    });
  });
};

// Lấy vị trí hiện tại của các xe
exports.getCurrentPositions = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cx.maChuyenXe, xb.bienSoXe, tx.tenTaiXe, vt.viDo, vt.kinhDo, vcx.thoiGianGhiNhan
      FROM vitrichuyenxe vcx
      INNER JOIN vitrithuc vt ON vcx.maViTriThuc = vt.maViTriThuc
      INNER JOIN chuyenxe cx ON vcx.maChuyenXe = cx.maChuyenXe
      INNER JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      INNER JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      WHERE vcx.thoiGianGhiNhan = (
        SELECT MAX(thoiGianGhiNhan) 
        FROM vitrichuyenxe 
        WHERE maChuyenXe = cx.maChuyenXe
      )
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getCurrentPositions:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
