const db = require("../config/db");

// Lấy tất cả tuyến đường
exports.getAllRoutes = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        td.maTuyenDuong,
        td.tenTuyenDuong,
        td.loai,
        COUNT(DISTINCT cttd.maDiemDung) as soTram
      FROM tuyenduong td
      LEFT JOIN chitiettuyenduong cttd ON td.maTuyenDuong = cttd.maTuyenDuong
      GROUP BY td.maTuyenDuong, td.tenTuyenDuong, td.loai
      ORDER BY td.maTuyenDuong
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getAllRoutes:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy chi tiết tuyến đường
exports.getRouteById = (routeId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM tuyenduong WHERE maTuyenDuong = ?";
    db.query(query, [routeId], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getRouteById:", err);
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
};

// Lấy danh sách trạm của tuyến đường
exports.getRouteStations = (routeId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cttd.maChiTietTuyenDuong,
        cttd.maTuyenDuong,
        cttd.maDiemDung,
        cttd.thuTu,
        cttd.thoiGianDuKien,
        cttd.loaiDiem,
        dd.tenDiemDung,
        dd.moTa,
        dd.trangThai,
        vt.viDo,
        vt.kinhDo
      FROM chitiettuyenduong cttd
      JOIN diemdung dd ON cttd.maDiemDung = dd.maDiemDung
      LEFT JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      WHERE cttd.maTuyenDuong = ?
      ORDER BY cttd.thuTu
    `;

    db.query(query, [routeId], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getRouteStations:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Tạo tuyến đường mới
exports.createRoute = (routeData) => {
  return new Promise((resolve, reject) => {
    const { tenTuyenDuong, loai } = routeData;
    const query = "INSERT INTO tuyenduong (tenTuyenDuong, loai) VALUES (?, ?)";

    db.query(query, [tenTuyenDuong, loai || "Chính"], (err, result) => {
      if (err) {
        console.error("❌ Lỗi createRoute:", err);
        reject(err);
      } else {
        resolve({ maTuyenDuong: result.insertId, tenTuyenDuong, loai });
      }
    });
  });
};

// Cập nhật tuyến đường
exports.updateRoute = (routeId, routeData) => {
  return new Promise((resolve, reject) => {
    const { tenTuyenDuong, loai } = routeData;
    const query =
      "UPDATE tuyenduong SET tenTuyenDuong = ?, loai = ? WHERE maTuyenDuong = ?";

    db.query(query, [tenTuyenDuong, loai, routeId], (err, result) => {
      if (err) {
        console.error("❌ Lỗi updateRoute:", err);
        reject(err);
      } else {
        resolve({ maTuyenDuong: routeId, tenTuyenDuong, loai });
      }
    });
  });
};

// Xóa tuyến đường
exports.deleteRoute = (routeId) => {
  return new Promise((resolve, reject) => {
    // Xóa chi tiết tuyến đường trước
    const deleteDetailsQuery =
      "DELETE FROM chitiettuyenduong WHERE maTuyenDuong = ?";

    db.query(deleteDetailsQuery, [routeId], (err) => {
      if (err) {
        console.error("❌ Lỗi xóa chi tiết tuyến đường:", err);
        reject(err);
        return;
      }

      // Sau đó xóa tuyến đường
      const deleteRouteQuery = "DELETE FROM tuyenduong WHERE maTuyenDuong = ?";
      db.query(deleteRouteQuery, [routeId], (err, result) => {
        if (err) {
          console.error("❌ Lỗi deleteRoute:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};

// Thêm trạm vào tuyến
exports.addStationToRoute = (routeId, stationData) => {
  return new Promise((resolve, reject) => {
    const { maDiemDung, thuTu, thoiGianDuKien, loaiDiem } = stationData;
    const query = `
      INSERT INTO chitiettuyenduong 
      (maTuyenDuong, maDiemDung, thuTu, thoiGianDuKien, loaiDiem) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [routeId, maDiemDung, thuTu, thoiGianDuKien, loaiDiem],
      (err, result) => {
        if (err) {
          console.error("❌ Lỗi addStationToRoute:", err);
          reject(err);
        } else {
          resolve({ maChiTietTuyenDuong: result.insertId, ...stationData });
        }
      }
    );
  });
};

// Thêm tọa độ mới
exports.addNewCoordinates = (coordinates) => {
  return new Promise((resolve, reject) => {
    const { viDo, kinhDo } = coordinates;
    const query = `
      INSERT INTO vitrithuc
      (viDo, kinhDo) 
      VALUES (?, ?)
    `;

    db.query(query, [viDo, kinhDo], (err, result) => {
      if (err) {
        console.error("❌ Lỗi addStationToRoute:", err);
        reject(err);
      } else {
        resolve({ maViTriThuc: result.insertId, ...coordinates });
      }
    });
  });
};

// ...existing code...

// UPDATED: Thêm trạm mới độc lập (không thuộc tuyến nào)
exports.addNewStation = (stationData, coordinates) => {
  return new Promise((resolve, reject) => {
    // 1. Thêm tọa độ trước
    exports
      .addNewCoordinates(coordinates)
      .then((coordinateResult) => {
        const maViTriThuc = coordinateResult.maViTriThuc;
        const { tenDiemDung, moTa, trangThai } = stationData;

        // 2. Thêm điểm dừng (maDiemDung sẽ AUTO_INCREMENT)
        const query = `
          INSERT INTO diemdung 
          (tenDiemDung, moTa, trangThai, maViTriThuc) 
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          query,
          [tenDiemDung, moTa, trangThai, maViTriThuc],
          (err, result) => {
            if (err) {
              console.error("❌ Lỗi addNewStation:", err);
              reject(err);
            } else {
              resolve({
                maDiemDung: result.insertId,
                tenDiemDung,
                moTa,
                trangThai,
                maViTriThuc: maViTriThuc,
                viDo: coordinates.viDo,
                kinhDo: coordinates.kinhDo,
              });
            }
          }
        );
      })
      .catch((error) => {
        console.error("❌ Lỗi khi thêm tọa độ:", error);
        reject(error);
      });
  });
};

// ...existing code...

// Cập nhật trạm trong tuyến
exports.updateStationInRoute = (routeId, stationId, updateData) => {
  return new Promise((resolve, reject) => {
    const { thuTu, thoiGianDuKien, loaiDiem } = updateData;
    const query = `
      UPDATE chitiettuyenduong 
      SET thuTu = ?, thoiGianDuKien = ?, loaiDiem = ?
      WHERE maTuyenDuong = ? AND maDiemDung = ?
    `;

    db.query(
      query,
      [thuTu, thoiGianDuKien, loaiDiem, routeId, stationId],
      (err, result) => {
        if (err) {
          console.error("❌ Lỗi updateStationInRoute:", err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Xóa trạm khỏi tuyến
exports.removeStationFromRoute = (routeId, stationId) => {
  return new Promise((resolve, reject) => {
    const query =
      "DELETE FROM chitiettuyenduong WHERE maTuyenDuong = ? AND maDiemDung = ?";

    db.query(query, [routeId, stationId], (err, result) => {
      if (err) {
        console.error("❌ Lỗi removeStationFromRoute:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.reorderStations = (routeId, stations) => {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting reorderStations...");
    console.log("  Route ID:", routeId);
    console.log("  Stations:", stations);

    const updatePromises = stations.map((station) => {
      return new Promise((resolveUpdate, rejectUpdate) => {
        const query = `
          UPDATE chitiettuyenduong 
          SET thuTu = ? 
          WHERE maTuyenDuong = ? AND maDiemDung = ?
        `;

        console.log(
          `🔄 Updating Station ${station.maDiemDung} → Order ${station.thuTu}`
        );

        db.query(
          query,
          [
            parseInt(station.thuTu),
            parseInt(routeId),
            parseInt(station.maDiemDung),
          ],
          (err, result) => {
            if (err) {
              console.error("❌ Lỗi update:", err);
              rejectUpdate(err);
            } else {
              console.log(
                `✅ Updated: Station ${station.maDiemDung}, Affected rows: ${result.affectedRows}`
              );
              resolveUpdate(result);
            }
          }
        );
      });
    });

    Promise.all(updatePromises)
      .then((results) => {
        console.log(`✅ All ${results.length} updates completed!`);
        resolve({ success: true, updatedCount: results.length });
      })
      .catch((error) => {
        console.error("❌ Lỗi trong Promise.all:", error);
        reject(error);
      });
  });
};
