// const db = require("../config/db");

// // Lấy tất cả dữ liệu cho bản đồ
// exports.getAllBusData = async () => {
//   try {
//     const [
//       hocsinh,
//       diachi,
//       vitrithuc,
//       taixe,
//       xebuyt,
//       chuyenxe,
//       lichtrinh,
//       tuyenduong,
//       phanbohocsinh,
//     ] = await Promise.all([
//       this.getHocSinh(),
//       this.getDiaChi(),
//       this.getViTriThuc(),
//       this.getTaiXe(),
//       this.getXeBuyt(),
//       this.getChuyenXe(),
//       this.getLichTrinh(),
//       this.getTuyenDuong(),
//       this.getPhanBoHocSinh(),
//     ]);

//     return {
//       hocsinh,
//       diachi,
//       vitrithuc,
//       taixe,
//       xebuyt,
//       chuyenxe,
//       lichtrinh,
//       tuyenduong,
//       phanbohocsinh,
//     };
//   } catch (error) {
//     throw new Error(`Lỗi lấy dữ liệu bus: ${error.message}`);
//   }
// };

// // Các hàm lấy dữ liệu từ database
// exports.getHocSinh = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM hocsinh", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getHocSinh:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getDiaChi = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM diachi", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getDiaChi:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getViTriThuc = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM vitrithuc", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getViTriThuc:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getTaiXe = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM taixe", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getTaiXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getXeBuyt = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM xebuyt", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getXeBuyt:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getChuyenXe = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM chuyenxe", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getChuyenXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getLichTrinh = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM lichtrinh", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getLichTrinh:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getTuyenDuong = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM tuyenduong", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getTuyenDuong:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getPhanBoHocSinh = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM phanbohocsinh", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoHocSinh:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Cập nhật vị trí xe (cho real-time tracking)
// exports.updateBusPosition = (busId, lat, lng, speed) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       INSERT INTO vitrichuyenxe (maChuyenXe, maViTriThuc, thoiGianGhiNhan)
//       VALUES (?, ?, NOW())
//     `;

//     // First, create or get location ID
//     const locationQuery = "INSERT INTO vitrithuc (viDo, kinhDo) VALUES (?, ?)";

//     db.query(locationQuery, [lat, lng], (err, locationResult) => {
//       if (err) {
//         console.error("❌ Lỗi tạo vị trí:", err);
//         reject(err);
//         return;
//       }

//       const locationId = locationResult.insertId;

//       db.query(query, [busId, locationId], (err, result) => {
//         if (err) {
//           console.error("❌ Lỗi cập nhật vị trí:", err);
//           reject(err);
//         } else {
//           resolve({ busId, lat, lng, speed, timestamp: new Date() });
//         }
//       });
//     });
//   });
// };

// // Lấy vị trí hiện tại của các xe
// exports.getCurrentPositions = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT cx.maChuyenXe, xb.bienSoXe, tx.tenTaiXe, vt.viDo, vt.kinhDo, vcx.thoiGianGhiNhan
//       FROM vitrichuyenxe vcx
//       INNER JOIN vitrithuc vt ON vcx.maViTriThuc = vt.maViTriThuc
//       INNER JOIN chuyenxe cx ON vcx.maChuyenXe = cx.maChuyenXe
//       INNER JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       INNER JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       WHERE vcx.thoiGianGhiNhan = (
//         SELECT MAX(thoiGianGhiNhan)
//         FROM vitrichuyenxe
//         WHERE maChuyenXe = cx.maChuyenXe
//       )
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getCurrentPositions:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // trackingService.js - Thêm các hàm mới

// // Lấy tất cả dữ liệu cho bản đồ (phiên bản mới với trạm)
// exports.getAllBusDataWithStations = async () => {
//   try {
//     const [
//       hocsinh,
//       diachi,
//       vitrithuc,
//       taixe,
//       xebuyt,
//       chuyenxe,
//       lichtrinh,
//       tuyenduong,
//       diemdung,
//       phanbohocsinhtram,
//       phanbotramxe,
//     ] = await Promise.all([
//       this.getHocSinh(),
//       this.getDiaChi(),
//       this.getViTriThuc(),
//       this.getTaiXe(),
//       this.getXeBuyt(),
//       this.getChuyenXe(),
//       this.getLichTrinh(),
//       this.getTuyenDuong(),
//       this.getDiemDung(),
//       this.getPhanBoHocSinhTram(),
//       this.getPhanBoTramXe(),
//     ]);

//     return {
//       hocsinh,
//       diachi,
//       vitrithuc,
//       taixe,
//       xebuyt,
//       chuyenxe,
//       lichtrinh,
//       tuyenduong,
//       diemdung,
//       phanbohocsinhtram,
//       phanbotramxe,
//     };
//   } catch (error) {
//     throw new Error(`Lỗi lấy dữ liệu bus với trạm: ${error.message}`);
//   }
// };

// // Các hàm mới để lấy dữ liệu trạm
// exports.getDiemDung = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM diemdung", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getDiemDung:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getPhanBoHocSinhTram = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM phanbohocsinhtram", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoHocSinhTram:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getPhanBoTramXe = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM phanbotramxe", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoTramXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

const db = require("../config/db");

// ==================== CODE CŨ - GIỮ NGUYÊN ====================

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

// ==================== HÀM CŨ VỚI TRẠM - GIỮ NGUYÊN ====================

exports.getDiemDung = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM diemdung", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getDiemDung:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getPhanBoHocSinhTram = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM phanbohocsinhtram", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoHocSinhTram:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getPhanBoTramXe = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM phanbotramxe", (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoTramXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// ==================== ✅ HÀM MỚI - THÊM VÀO ====================

// ✅ HÀM MỚI: Lấy dữ liệu với JOIN để có đầy đủ thông tin trạm
exports.getAllBusDataWithStations = async () => {
  try {
    console.log("🔍 Fetching all bus data with stations (NEW VERSION)...");

    // Lấy các bảng cơ bản (dùng callback cũ)
    const [
      hocsinh,
      diachi,
      vitrithuc,
      taixe,
      xebuyt,
      chuyenxe,
      lichtrinh,
      tuyenduong,
    ] = await Promise.all([
      this.getHocSinh(),
      this.getDiaChi(),
      this.getViTriThuc(),
      this.getTaiXe(),
      this.getXeBuyt(),
      this.getChuyenXe(),
      this.getLichTrinh(),
      this.getTuyenDuong(),
    ]);

    // ✅ Lấy điểm dừng với JOIN để có tọa độ
    const diemdung = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          dd.maDiemDung,
          dd.tenDiemDung,
          dd.moTa,
          dd.trangThai,
          dd.maViTriThuc,
          vt.viDo,
          vt.kinhDo
        FROM diemdung dd
        LEFT JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
        WHERE dd.trangThai = 'Active'
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Lỗi getDiemDung with JOIN:", err);
          reject(err);
        } else {
          console.log(`✅ Loaded ${results.length} điểm dừng`);
          resolve(results);
        }
      });
    });

    // ✅ Lấy phân bổ trạm xe với JOIN
    const phanbotramxe = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pbtx.*,
          dd.tenDiemDung,
          dd.moTa as moTaDiemDung
        FROM phanbotramxe pbtx
        LEFT JOIN diemdung dd ON pbtx.maDiemDung = dd.maDiemDung
        WHERE pbtx.trangThai = 'Active'
        ORDER BY pbtx.maChuyenXe, pbtx.thuTuDon
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Lỗi getPhanBoTramXe with JOIN:", err);
          reject(err);
        } else {
          console.log(`✅ Loaded ${results.length} phân bổ trạm xe`);
          resolve(results);
        }
      });
    });

    // ✅ Lấy phân bổ học sinh trạm với JOIN
    const phanbohocsinhtram = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pbhst.maPhanBoHocSinhTram,
          pbhst.maHocSinh,
          pbhst.maDiemDung,
          pbhst.loaiPhanBo,
          pbhst.trangThai,
          hs.tenHocSinh,
          hs.lop,
          dd.tenDiemDung
        FROM phanbohocsinhtram pbhst
        LEFT JOIN hocsinh hs ON pbhst.maHocSinh = hs.maHocSinh
        LEFT JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
        WHERE pbhst.trangThai = 'Active'
          AND hs.trangThai = 'Active'
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Lỗi getPhanBoHocSinhTram with JOIN:", err);
          reject(err);
        } else {
          console.log(`✅ Loaded ${results.length} phân bổ học sinh trạm`);
          resolve(results);
        }
      });
    });

    // ✅ Lấy vị trí chuyến xe (mới nhất)
    const vitrichuyenxe = await new Promise((resolve, reject) => {
      const query = `
        SELECT vcx1.*, vt.viDo, vt.kinhDo
        FROM vitrichuyenxe vcx1
        LEFT JOIN vitrithuc vt ON vcx1.maViTriThuc = vt.maViTriThuc
        INNER JOIN (
          SELECT maChuyenXe, MAX(thoiGianGhiNhan) as maxTime
          FROM vitrichuyenxe
          GROUP BY maChuyenXe
        ) vcx2 ON vcx1.maChuyenXe = vcx2.maChuyenXe 
          AND vcx1.thoiGianGhiNhan = vcx2.maxTime
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Lỗi getViTriChuyenXe:", err);
          reject(err);
        } else {
          console.log(`✅ Loaded ${results.length} vị trí chuyến xe`);
          resolve(results);
        }
      });
    });

    console.log("✅ Data fetched successfully:");
    console.log("  - Chuyến xe:", chuyenxe.length);
    console.log("  - Xe buýt:", xebuyt.length);
    console.log("  - Điểm dừng:", diemdung.length);
    console.log("  - Phân bổ trạm xe:", phanbotramxe.length);
    console.log("  - Phân bổ học sinh trạm:", phanbohocsinhtram.length);

    // ✅ Log chi tiết học sinh tại mỗi trạm
    const stationStudentCount = {};
    phanbohocsinhtram.forEach((pbhst) => {
      const key = `${pbhst.maDiemDung}-${pbhst.loaiPhanBo}`;
      if (!stationStudentCount[key]) {
        stationStudentCount[key] = 0;
      }
      stationStudentCount[key]++;
    });

    console.log("📊 Số học sinh tại mỗi trạm:");
    Object.entries(stationStudentCount).forEach(([key, count]) => {
      const [diemDungId, loai] = key.split("-");
      const tram = diemdung.find((dd) => dd.id === parseInt(diemDungId));
      console.log(`  - Trạm ${tram?.tenDiemDung} (${loai}): ${count} học sinh`);
    });

    return {
      hocsinh,
      diachi,
      vitrithuc,
      taixe,
      xebuyt,
      chuyenxe,
      lichtrinh,
      tuyenduong,
      diemdung,
      phanbotramxe,
      phanbohocsinhtram,
      vitrichuyenxe,
    };
  } catch (error) {
    console.error("❌ Error in getAllBusDataWithStations:", error);
    console.error("❌ Error stack:", error.stack);
    throw error;
  }
};
