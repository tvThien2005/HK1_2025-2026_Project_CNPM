// const db = require("../config/db");

// // Lấy tất cả dữ liệu cho bản đồ
// exports.getAllMapData = async () => {
//   try {
//     const [
//       diemdung,
//       phanbohocsinhtram,
//       phanbotramxe,
//       chitiettuyenduong
//     ] = await Promise.all([
//       this.getDiemDung(),
//       this.getPhanBoHocSinhTram(),
//       this.getPhanBoTramXe(),
//       this.getChiTietTuyenDuong()
//     ]);

//     return {
//       diemdung,
//       phanbohocsinhtram,
//       phanbotramxe,
//       chitiettuyenduong
//     };
//   } catch (error) {
//     throw new Error(`Lỗi lấy dữ liệu bản đồ: ${error.message}`);
//   }
// };

// // Lấy danh sách điểm dừng
// exports.getDiemDung = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT dd.*, vt.kinhDo, vt.viDo
//       FROM diemdung dd
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE dd.trangThai = 'Active'
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getDiemDung:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy phân bổ học sinh trạm
// exports.getPhanBoHocSinhTram = (maHocSinh = null, maDiemDung = null, maChuyenXe = null) => {
//   return new Promise((resolve, reject) => {
//     let query = `
//       SELECT pbhst.*, 
//              hs.tenHocSinh,
//              hs.lop,
//              hs.anhHocSinh,
//              dd.tenDiemDung,
//              dd.maViTriThuc,
//              vt.kinhDo, 
//              vt.viDo
//       FROM phanbohocsinhtram pbhst
//       JOIN hocsinh hs ON pbhst.maHocSinh = hs.maHocSinh
//       JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE pbhst.trangThai = 'Active'
//     `;
    
//     const params = [];
    
//     if (maHocSinh) {
//       query += " AND pbhst.maHocSinh = ?";
//       params.push(maHocSinh);
//     }
    
//     if (maDiemDung) {
//       query += " AND pbhst.maDiemDung = ?";
//       params.push(maDiemDung);
//     }
    
//     if (maChuyenXe) {
//       query = `
//         SELECT pbhst.*, 
//                hs.tenHocSinh,
//                hs.lop,
//                hs.anhHocSinh,
//                dd.tenDiemDung,
//                dd.maViTriThuc,
//                vt.kinhDo, 
//                vt.viDo
//         FROM phanbohocsinhtram pbhst
//         JOIN hocsinh hs ON pbhst.maHocSinh = hs.maHocSinh
//         JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
//         JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//         JOIN phanbotramxe pbtx ON pbhst.maDiemDung = pbtx.maDiemDung
//         WHERE pbhst.trangThai = 'Active' AND pbtx.maChuyenXe = ?
//       `;
//       params.push(maChuyenXe);
//     }
    
//     query += " ORDER BY pbhst.maHocSinh, pbhst.loaiPhanBo";

//     db.query(query, params, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoHocSinhTram:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy phân bổ trạm xe
// exports.getPhanBoTramXe = (maDiemDung = null, maChuyenXe = null) => {
//   return new Promise((resolve, reject) => {
//     let query = `
//       SELECT pbtx.*,
//              dd.tenDiemDung,
//              dd.maViTriThuc,
//              vt.kinhDo,
//              vt.viDo,
//              cx.maChuyenXe,
//              xb.bienSoXe,
//              tx.tenTaiXe
//       FROM phanbotramxe pbtx
//       JOIN diemdung dd ON pbtx.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       WHERE pbtx.trangThai = 'Active'
//     `;
    
//     const params = [];
    
//     if (maDiemDung) {
//       query += " AND pbtx.maDiemDung = ?";
//       params.push(maDiemDung);
//     }
    
//     if (maChuyenXe) {
//       query += " AND pbtx.maChuyenXe = ?";
//       params.push(maChuyenXe);
//     }
    
//     query += " ORDER BY pbtx.maChuyenXe, pbtx.thuTuDon";

//     db.query(query, params, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoTramXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy chi tiết tuyến đường
// exports.getChiTietTuyenDuong = (maTuyenDuong = null) => {
//   return new Promise((resolve, reject) => {
//     let query = `
//       SELECT cttd.*,
//              dd.tenDiemDung,
//              dd.maViTriThuc,
//              vt.kinhDo,
//              vt.viDo,
//              td.tenTuyenDuong,
//              td.loai
//       FROM chitiettuyenduong cttd
//       JOIN diemdung dd ON cttd.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       JOIN tuyenduong td ON cttd.maTuyenDuong = td.maTuyenDuong
//       WHERE 1=1
//     `;
    
//     const params = [];
    
//     if (maTuyenDuong) {
//       query += " AND cttd.maTuyenDuong = ?";
//       params.push(maTuyenDuong);
//     }
    
//     query += " ORDER BY cttd.maTuyenDuong, cttd.thuTu";

//     db.query(query, params, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getChiTietTuyenDuong:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy học sinh theo điểm dừng
// exports.getHocSinhTheoDiemDung = (maDiemDung, loaiPhanBo) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT hs.*, pbhst.loaiPhanBo
//       FROM hocsinh hs
//       JOIN phanbohocsinhtram pbhst ON hs.maHocSinh = pbhst.maHocSinh
//       WHERE pbhst.maDiemDung = ? 
//         AND pbhst.loaiPhanBo = ?
//         AND pbhst.trangThai = 'Active'
//         AND hs.trangThai = 'Active'
//     `;

//     db.query(query, [maDiemDung, loaiPhanBo], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getHocSinhTheoDiemDung:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy chuyến xe theo tuyến
// exports.getChuyenXeTheoTuyen = (maTuyenDuong) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE cx.maTuyenDuong = ? AND cx.trangThai = 'InProgress'
//     `;

//     db.query(query, [maTuyenDuong], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getChuyenXeTheoTuyen:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };
const db = require("../config/db");

// Lấy tất cả dữ liệu cho bản đồ
exports.getAllMapData = async () => {
  try {
    console.log("🗺️ Getting all map data...");
    
    const [
      diemdung,
      phanbohocsinhtram,
      phanbotramxe,
      chitiettuyenduong
    ] = await Promise.all([
      this.getDiemDung(),
      this.getPhanBoHocSinhTram(),
      this.getPhanBoTramXe(),
      this.getChiTietTuyenDuong()
    ]);

    console.log("✅ Map data retrieved successfully");
    
    return {
      diemdung,
      phanbohocsinhtram,
      phanbotramxe,
      chitiettuyenduong
    };
  } catch (error) {
    console.error("❌ Lỗi getAllMapData:", error);
    throw new Error(`Lỗi lấy dữ liệu bản đồ: ${error.message}`);
  }
};

// Lấy danh sách điểm dừng
exports.getDiemDung = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT dd.*, vt.kinhDo, vt.viDo
      FROM diemdung dd
      JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      WHERE dd.trangThai = 'Active'
      LIMIT 100
    `;

    console.log("📍 Getting bus stops...");
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getDiemDung:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} bus stops`);
        resolve(results);
      }
    });
  });
};

// Lấy phân bổ học sinh trạm
exports.getPhanBoHocSinhTram = (maHocSinh = null, maDiemDung = null, maChuyenXe = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT pbhst.*, 
             hs.tenHocSinh,
             hs.lop,
             hs.anhHocSinh,
             dd.tenDiemDung,
             dd.maViTriThuc,
             vt.kinhDo, 
             vt.viDo
      FROM phanbohocsinhtram pbhst
      JOIN hocsinh hs ON pbhst.maHocSinh = hs.maHocSinh
      JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
      JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      WHERE pbhst.trangThai = 'Active'
    `;
    
    const params = [];
    
    if (maHocSinh) {
      query += " AND pbhst.maHocSinh = ?";
      params.push(maHocSinh);
    }
    
    if (maDiemDung) {
      query += " AND pbhst.maDiemDung = ?";
      params.push(maDiemDung);
    }
    
    if (maChuyenXe) {
      query = `
        SELECT pbhst.*, 
               hs.tenHocSinh,
               hs.lop,
               hs.anhHocSinh,
               dd.tenDiemDung,
               dd.maViTriThuc,
               vt.kinhDo, 
               vt.viDo
        FROM phanbohocsinhtram pbhst
        JOIN hocsinh hs ON pbhst.maHocSinh = hs.maHocSinh
        JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
        JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
        JOIN phanbotramxe pbtx ON pbhst.maDiemDung = pbtx.maDiemDung
        WHERE pbhst.trangThai = 'Active' AND pbtx.maChuyenXe = ?
      `;
      params.push(maChuyenXe);
    }
    
    query += " ORDER BY pbhst.maHocSinh, pbhst.loaiPhanBo LIMIT 100";

    console.log("🎯 Getting student-stop allocations...", { maHocSinh, maDiemDung, maChuyenXe });
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoHocSinhTram:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} student-stop allocations`);
        resolve(results);
      }
    });
  });
};

// Lấy phân bổ trạm xe
exports.getPhanBoTramXe = (maDiemDung = null, maChuyenXe = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT pbtx.*,
             dd.tenDiemDung,
             dd.maViTriThuc,
             vt.kinhDo,
             vt.viDo,
             cx.maChuyenXe,
             xb.bienSoXe,
             tx.tenTaiXe
      FROM phanbotramxe pbtx
      JOIN diemdung dd ON pbtx.maDiemDung = dd.maDiemDung
      JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      WHERE pbtx.trangThai = 'Active'
    `;
    
    const params = [];
    
    if (maDiemDung) {
      query += " AND pbtx.maDiemDung = ?";
      params.push(maDiemDung);
    }
    
    if (maChuyenXe) {
      query += " AND pbtx.maChuyenXe = ?";
      params.push(maChuyenXe);
    }
    
    query += " ORDER BY pbtx.maChuyenXe, pbtx.thuTuDon LIMIT 100";

    console.log("🚏 Getting stop-bus allocations...", { maDiemDung, maChuyenXe });
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoTramXe:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} stop-bus allocations`);
        resolve(results);
      }
    });
  });
};

// Lấy chi tiết tuyến đường
exports.getChiTietTuyenDuong = (maTuyenDuong = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT cttd.*,
             dd.tenDiemDung,
             dd.maViTriThuc,
             vt.kinhDo,
             vt.viDo,
             td.tenTuyenDuong,
             td.loai
      FROM chitiettuyenduong cttd
      JOIN diemdung dd ON cttd.maDiemDung = dd.maDiemDung
      JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      JOIN tuyenduong td ON cttd.maTuyenDuong = td.maTuyenDuong
      WHERE 1=1
    `;
    
    const params = [];
    
    if (maTuyenDuong) {
      query += " AND cttd.maTuyenDuong = ?";
      params.push(maTuyenDuong);
    }
    
    query += " ORDER BY cttd.maTuyenDuong, cttd.thuTu LIMIT 100";

    console.log("🛣️ Getting route details...", { maTuyenDuong });
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getChiTietTuyenDuong:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} route details`);
        resolve(results);
      }
    });
  });
};

// Lấy học sinh theo điểm dừng
exports.getHocSinhTheoDiemDung = (maDiemDung, loaiPhanBo) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT hs.*, pbhst.loaiPhanBo
      FROM hocsinh hs
      JOIN phanbohocsinhtram pbhst ON hs.maHocSinh = pbhst.maHocSinh
      WHERE pbhst.maDiemDung = ? 
        AND pbhst.loaiPhanBo = ?
        AND pbhst.trangThai = 'Active'
        AND hs.trangThai = 'Active'
      LIMIT 50
    `;

    console.log("🎓 Getting students by stop...", { maDiemDung, loaiPhanBo });
    
    db.query(query, [maDiemDung, loaiPhanBo], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getHocSinhTheoDiemDung:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} students for stop ${maDiemDung}`);
        resolve(results);
      }
    });
  });
};

// Lấy chuyến xe theo tuyến
exports.getChuyenXeTheoTuyen = (maTuyenDuong) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.thoiGianDi, lt.thoiGianDen
      FROM chuyenxe cx
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      WHERE cx.maTuyenDuong = ? AND cx.trangThai = 'InProgress'
      LIMIT 20
    `;

    console.log("🚗 Getting trips by route...", { maTuyenDuong });
    
    db.query(query, [maTuyenDuong], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getChuyenXeTheoTuyen:", err);
        reject(err);
      } else {
        console.log(`✅ Found ${results.length} active trips for route ${maTuyenDuong}`);
        resolve(results);
      }
    });
  });
};