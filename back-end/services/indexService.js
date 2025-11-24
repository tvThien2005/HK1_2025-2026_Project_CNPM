// const db = require("../config/db");

// // Đăng nhập
// exports.login = (username, password) => {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT * FROM taikhoan WHERE tenDangNhap = ? LIMIT 1";
    
//     db.query(query, [username], async (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi login:", err);
//         reject(err);
//         return;
//       }

//       if (results.length === 0) {
//         reject(new Error("Sai tài khoản hoặc mật khẩu"));
//         return;
//       }

//       const user = results[0];
//       if (user.matKhau !== password) {
//         reject(new Error("Sai tài khoản hoặc mật khẩu"));
//         return;
//       }

//       try {
//         // Lấy thông tin profile
//         const profileQuery = `
//           SELECT tk.maTaiKhoan, tk.tenDangNhap, tk.capDo, tk.trangThai, tk.block,
//                  COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
//           FROM taikhoan tk
//           LEFT JOIN taixe tx ON tk.maTaiKhoan = tx.maTaiKhoan
//           LEFT JOIN quanLyxe ql ON tk.maTaiKhoan = ql.maTaiKhoan
//           LEFT JOIN phuhuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//           WHERE tk.maTaiKhoan = ?
//           LIMIT 1
//         `;

//         db.query(profileQuery, [user.maTaiKhoan], (profileErr, profileResults) => {
//           if (profileErr) {
//             reject(profileErr);
//             return;
//           }

//           const profile = profileResults[0] || {};
//           resolve({
//             maTaiKhoan: user.maTaiKhoan,
//             tenDangNhap: user.tenDangNhap,
//             capDo: user.capDo,
//             trangThai: user.trangThai,
//             block: user.block,
//             tenNguoiDung: profile.tenNguoiDung || null,
//           });
//         });
//       } catch (error) {
//         reject(error);
//       }
//     });
//   });
// };

// // Lấy thông tin tài khoản
// exports.getAccountInfo = (maTaiKhoan) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT tk.*, 
//              COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
//       FROM taikhoan tk
//       LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
//       LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
//       LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//       WHERE tk.maTaiKhoan = ? LIMIT 1
//     `;

//     db.query(query, [maTaiKhoan], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getAccountInfo:", err);
//         reject(err);
//       } else {
//         resolve(results[0] || null);
//       }
//     });
//   });
// };

// // Lấy danh sách học sinh
// exports.getHocSinh = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         hs.maHocSinh,
//         hs.tenHocSinh,
//         hs.lop,
//         hs.anhHocSinh,
//         hs.trangThai,
//         dc.soNha,
//         dc.duong,
//         dc.phuongXa,
//         dc.quanHuyen,
//         dc.thanhPho,
//         vt.kinhDo,
//         vt.viDo
//       FROM hocsinh hs
//       LEFT JOIN diachi dc ON hs.maDiaChi = dc.maDiaChi
//       LEFT JOIN vitrithuc vt ON dc.maViTriThuc = vt.maViTriThuc
//       WHERE hs.trangThai = 'Active'
//       ORDER BY hs.maHocSinh
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getHocSinh:", err);
//         reject(err);
//       } else {
//         // Xử lý thêm thông tin trips cho học sinh
//         const processStudents = async () => {
//           const studentsWithTrips = [];
          
//           for (const student of results) {
//             try {
//               const allocations = await this.getStudentAllocations(student.maHocSinh);
//               const trips = await this.getStudentTrips(allocations);
              
//               studentsWithTrips.push({
//                 ...student,
//                 trips: trips
//               });
//             } catch (error) {
//               console.error(`❌ Lỗi xử lý học sinh ${student.maHocSinh}:`, error);
//               studentsWithTrips.push({
//                 ...student,
//                 trips: []
//               });
//             }
//           }
          
//           resolve(studentsWithTrips);
//         };
        
//         processStudents();
//       }
//     });
//   });
// };

// // Helper function - Lấy phân bổ của học sinh
// exports.getStudentAllocations = (maHocSinh) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT pbhst.*, 
//              dd.tenDiemDung,
//              dd.maViTriThuc,
//              vt.kinhDo as stopKinhDo,
//              vt.viDo as stopViDo
//       FROM phanbohocsinhtram pbhst
//       JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE pbhst.maHocSinh = ? AND pbhst.trangThai = 'Active'
//     `;

//     db.query(query, [maHocSinh], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Helper function - Lấy chuyến xe của học sinh
// exports.getStudentTrips = (allocations) => {
//   return new Promise((resolve, reject) => {
//     if (!allocations || allocations.length === 0) {
//       resolve([]);
//       return;
//     }

//     const trips = [];
//     let processed = 0;

//     allocations.forEach(alloc => {
//       const query = `
//         SELECT pbtx.*,
//                cx.maChuyenXe,
//                cx.maXeBuyt,
//                cx.maTaiXe,
//                cx.maLichTrinh,
//                cx.maTuyenDuong,
//                cx.trangThai as chuyenTrangThai,
//                xb.bienSoXe,
//                tx.tenTaiXe,
//                tx.anhTaiXe,
//                td.tenTuyenDuong,
//                lt.ngay,
//                lt.thoiGianDi,
//                lt.thoiGianDen
//         FROM phanbotramxe pbtx
//         JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
//         JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//         JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//         JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//         JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//         WHERE pbtx.maDiemDung = ? AND pbtx.trangThai = 'Active'
//       `;

//       db.query(query, [alloc.maDiemDung], (err, results) => {
//         if (err) {
//           console.error("❌ Lỗi getStudentTrips:", err);
//         } else {
//           trips.push(...results);
//         }

//         processed++;
//         if (processed === allocations.length) {
//           // Format trips
//           const formattedTrips = trips.map(trip => ({
//             maChuyenXe: trip.maChuyenXe,
//             bienSoXe: trip.bienSoXe,
//             tenTaiXe: trip.tenTaiXe,
//             anhTaiXe: trip.anhTaiXe,
//             tenTuyenDuong: trip.tenTuyenDuong,
//             thoiGianDi: trip.thoiGianDi,
//             thoiGianDen: trip.thoiGianDen,
//             ngay: trip.ngay,
//             trangThai: trip.chuyenTrangThai
//           }));
//           resolve(formattedTrips);
//         }
//       });
//     });
//   });
// };

// // Lấy danh sách xe buýt
// exports.getXeBuyt = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM xeBuyt", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getXeBuyt:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy danh sách tuyến đường
// exports.getTuyenDuong = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM tuyenDuong", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getTuyenDuong:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy danh sách lịch trình
// exports.getLichTrinh = () => {
//   return new Promise((resolve, reject) => {
//     db.query("SELECT * FROM lichTrinh", (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getLichTrinh:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy danh sách chuyến xe
// exports.getChuyenXe = (status = null) => {
//   return new Promise((resolve, reject) => {
//     let query = `
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//     `;
    
//     if (status) {
//       query += ` WHERE cx.trangThai = '${status}'`;
//     }

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getChuyenXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy thông tin chuyến xe theo ID
// exports.getChuyenXeById = (maChuyenXe) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE cx.maChuyenXe = ?
//     `;

//     db.query(query, [maChuyenXe], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getChuyenXeById:", err);
//         reject(err);
//       } else {
//         resolve(results[0] || null);
//       }
//     });
//   });
// };

// // Cập nhật trạng thái chuyến xe
// exports.updateChuyenXeStatus = (maChuyenXe, trangThai) => {
//   return new Promise((resolve, reject) => {
//     const query = 'UPDATE chuyenxe SET trangThai = ? WHERE maChuyenXe = ?';
    
//     db.query(query, [trangThai, maChuyenXe], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi updateChuyenXeStatus:", err);
//         reject(err);
//       } else {
//         resolve({ 
//           affectedRows: results.affectedRows,
//           message: 'Cập nhật trạng thái thành công' 
//         });
//       }
//     });
//   });
// };

// // Lấy danh sách tài xế
// exports.getTaiXe = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT tx.*, tk.tenDangNhap
//       FROM taixe tx
//       LEFT JOIN taikhoan tk ON tx.maTaiKhoan = tk.maTaiKhoan
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getTaiXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy danh sách phụ huynh
// exports.getPhuHuynh = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT ph.*, hs.tenHocSinh, hs.lop
//       FROM phuhuynh ph
//       JOIN hocsinh hs ON ph.maHocSinh = hs.maHocSinh
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhuHuynh:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy vị trí chuyến xe
// exports.getViTriChuyenXe = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT vc.maViTriChuyenXe, vc.maChuyenXe, vt.kinhDo, vt.viDo, vc.thoiGianGhiNhan
//       FROM vitrichuyenxe vc
//       JOIN vitrithuc vt ON vc.maViTriThuc = vt.maViTriThuc
//       ORDER BY vc.thoiGianGhiNhan DESC
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getViTriChuyenXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy thông báo
// exports.getThongBao = (maTaiKhoan) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT tb.maThongBao, tb.noiDung, tb.thoiGianTao
//       FROM thongbao tb
//       JOIN chitietthongbao ct ON tb.maThongBao = ct.maThongBao
//       WHERE ct.maTaiKhoan = ?
//       ORDER BY tb.thoiGianTao DESC
//     `;

//     db.query(query, [maTaiKhoan], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getThongBao:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy cảnh báo
// exports.getCanhBao = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT cb.maCanhBao, cb.noiDung, cb.thoiGianTao, tx.tenTaiXe
//       FROM canhbao cb
//       LEFT JOIN taixe tx ON cb.maTaiXe = tx.maTaiXe
//       ORDER BY cb.thoiGianTao DESC
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getCanhBao:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// exports.getParentStudents = (maTaiKhoan) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT hs.maHocSinh, hs.tenHocSinh, hs.lop, hs.anhHocSinh
//       FROM phuhuynh ph
//       JOIN hocsinh hs ON ph.maHocSinh = hs.maHocSinh
//       WHERE ph.maTaiKhoan = ? AND hs.trangThai = 'Active'
//     `;

//     console.log("🔍 Executing query for parent students:", query);
//     console.log("📝 With maTaiKhoan:", maTaiKhoan);

//     db.query(query, [maTaiKhoan], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getParentStudents:", err);
//         reject(err);
//       } else {
//         console.log("✅ Parent students found:", results);
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy phân bổ học sinh trạm theo chuyến xe
// exports.getPhanBoHocSinhTramByChuyenXe = (maChuyenXe) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT pbhst.*, dd.tenDiemDung, vt.kinhDo, vt.viDo
//       FROM phanbohocsinhtram pbhst
//       JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE pbhst.maChuyenXe = ? AND pbhst.trangThai = 'Active'
//     `;

//     db.query(query, [maChuyenXe], (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getPhanBoHocSinhTramByChuyenXe:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

// // Lấy tất cả chuyến xe với thông tin đầy đủ (cho StudentCard)
// exports.getAllTripsWithDetails = () => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT 
//         cx.maChuyenXe,
//         cx.maXeBuyt,
//         cx.maTaiXe,
//         cx.maLichTrinh,
//         cx.maTuyenDuong,
//         cx.trangThai,
//         xb.bienSoXe,
//         tx.tenTaiXe,
//         tx.anhTaiXe,
//         td.tenTuyenDuong,
//         lt.ngay,
//         lt.thoiGianDi,
//         lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       ORDER BY lt.ngay DESC, lt.thoiGianDi ASC
//     `;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error("❌ Lỗi getAllTripsWithDetails:", err);
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };
// services/indexService.js
const db = require("../config/db");

// Đăng nhập
exports.login = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM taikhoan WHERE tenDangNhap = ? LIMIT 1";
    
    console.log("🔍 Executing login query...");
    
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error("❌ Lỗi login:", err);
        reject(err);
        return;
      }

      if (results.length === 0) {
        reject(new Error("Sai tài khoản hoặc mật khẩu"));
        return;
      }

      const user = results[0];
      if (user.matKhau !== password) {
        reject(new Error("Sai tài khoản hoặc mật khẩu"));
        return;
      }

      // Lấy thông tin profile
      const profileQuery = `
        SELECT tk.maTaiKhoan, tk.tenDangNhap, tk.capDo, tk.trangThai, tk.block,
               COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
        FROM taikhoan tk
        LEFT JOIN taixe tx ON tk.maTaiKhoan = tx.maTaiKhoan
        LEFT JOIN quanlyxe ql ON tk.maTaiKhoan = ql.maTaiKhoan
        LEFT JOIN phuhuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
        WHERE tk.maTaiKhoan = ?
        LIMIT 1
      `;

      db.query(profileQuery, [user.maTaiKhoan], (profileErr, profileResults) => {
        if (profileErr) {
          reject(profileErr);
          return;
        }

        const profile = profileResults[0] || {};
        resolve({
          maTaiKhoan: user.maTaiKhoan,
          tenDangNhap: user.tenDangNhap,
          capDo: user.capDo,
          trangThai: user.trangThai,
          block: user.block,
          tenNguoiDung: profile.tenNguoiDung || null,
        });
      });
    });
  });
};

// Lấy thông tin tài khoản
exports.getAccountInfo = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tk.*, 
             COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
      FROM taikhoan tk
      LEFT JOIN taixe tx ON tk.maTaiKhoan = tx.maTaiKhoan
      LEFT JOIN quanlyxe ql ON tk.maTaiKhoan = ql.maTaiKhoan
      LEFT JOIN phuhuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
      WHERE tk.maTaiKhoan = ? LIMIT 1
    `;

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getAccountInfo:", err);
        reject(err);
      } else {
        resolve(results[0] || null);
      }
    });
  });
};

// Lấy danh sách học sinh - ĐƠN GIẢN HÓA
exports.getHocSinh = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        hs.maHocSinh,
        hs.tenHocSinh,
        hs.lop,
        hs.anhHocSinh,
        hs.trangThai
      FROM hocsinh hs
      WHERE hs.trangThai = 'Active'
      ORDER BY hs.maHocSinh
      LIMIT 50
    `;

    console.log("🔍 Executing getHocSinh query...");
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getHocSinh:", err);
        reject(err);
      } else {
        console.log("✅ getHocSinh results:", results.length, "records");
        // Đơn giản hóa: không lấy trips phức tạp ngay
        resolve(results);
      }
    });
  });
};

// Lấy danh sách xe buýt
exports.getXeBuyt = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM xebuyt LIMIT 50";
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getXeBuyt:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy danh sách tuyến đường
exports.getTuyenDuong = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM tuyenduong LIMIT 50";
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getTuyenDuong:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy danh sách lịch trình
exports.getLichTrinh = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM lichtrinh LIMIT 50";
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getLichTrinh:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy danh sách chuyến xe
exports.getChuyenXe = (status = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
      FROM chuyenxe cx
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      LIMIT 50
    `;
    
    if (status) {
      query = query.replace('LIMIT 50', ` WHERE cx.trangThai = '${status}' LIMIT 50`);
    }

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getChuyenXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy thông tin chuyến xe theo ID
exports.getChuyenXeById = (maChuyenXe) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
      FROM chuyenxe cx
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      WHERE cx.maChuyenXe = ?
    `;

    db.query(query, [maChuyenXe], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getChuyenXeById:", err);
        reject(err);
      } else {
        resolve(results[0] || null);
      }
    });
  });
};

// Cập nhật trạng thái chuyến xe
exports.updateChuyenXeStatus = (maChuyenXe, trangThai) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE chuyenxe SET trangThai = ? WHERE maChuyenXe = ?';
    
    db.query(query, [trangThai, maChuyenXe], (err, results) => {
      if (err) {
        console.error("❌ Lỗi updateChuyenXeStatus:", err);
        reject(err);
      } else {
        resolve({ 
          affectedRows: results.affectedRows,
          message: 'Cập nhật trạng thái thành công' 
        });
      }
    });
  });
};

// Lấy danh sách tài xế
exports.getTaiXe = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tx.*, tk.tenDangNhap
      FROM taixe tx
      LEFT JOIN taikhoan tk ON tx.maTaiKhoan = tk.maTaiKhoan
      LIMIT 50
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getTaiXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy danh sách phụ huynh
exports.getPhuHuynh = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT ph.*, hs.tenHocSinh, hs.lop
      FROM phuhuynh ph
      JOIN hocsinh hs ON ph.maHocSinh = hs.maHocSinh
      LIMIT 50
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhuHuynh:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy vị trí chuyến xe
exports.getViTriChuyenXe = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT vc.maViTriChuyenXe, vc.maChuyenXe, vt.kinhDo, vt.viDo, vc.thoiGianGhiNhan
      FROM vitrichuyenxe vc
      JOIN vitrithuc vt ON vc.maViTriThuc = vt.maViTriThuc
      ORDER BY vc.thoiGianGhiNhan DESC
      LIMIT 50
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getViTriChuyenXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy thông báo
exports.getThongBao = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tb.maThongBao, tb.noiDung, tb.thoiGianTao
      FROM thongbao tb
      JOIN chitietthongbao ct ON tb.maThongBao = ct.maThongBao
      WHERE ct.maTaiKhoan = ?
      ORDER BY tb.thoiGianTao DESC
      LIMIT 20
    `;

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getThongBao:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy cảnh báo
exports.getCanhBao = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT cb.maCanhBao, cb.noiDung, cb.thoiGianTao, tx.tenTaiXe
      FROM canhbao cb
      LEFT JOIN taixe tx ON cb.maTaiXe = tx.maTaiXe
      ORDER BY cb.thoiGianTao DESC
      LIMIT 20
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getCanhBao:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy học sinh của phụ huynh
exports.getParentStudents = (maTaiKhoan) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT hs.maHocSinh, hs.tenHocSinh, hs.lop, hs.anhHocSinh
      FROM phuhuynh ph
      JOIN hocsinh hs ON ph.maHocSinh = hs.maHocSinh
      WHERE ph.maTaiKhoan = ? AND hs.trangThai = 'Active'
      LIMIT 10
    `;

    console.log("🔍 Executing getParentStudents query...");
    console.log("📝 With maTaiKhoan:", maTaiKhoan);

    db.query(query, [maTaiKhoan], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getParentStudents:", err);
        reject(err);
      } else {
        console.log("✅ Parent students found:", results.length, "records");
        resolve(results);
      }
    });
  });
};

// Lấy phân bổ học sinh trạm theo chuyến xe
exports.getPhanBoHocSinhTramByChuyenXe = (maChuyenXe) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT pbhst.*, dd.tenDiemDung, vt.kinhDo, vt.viDo
      FROM phanbohocsinhtram pbhst
      JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
      JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      WHERE pbhst.maChuyenXe = ? AND pbhst.trangThai = 'Active'
      LIMIT 20
    `;

    db.query(query, [maChuyenXe], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getPhanBoHocSinhTramByChuyenXe:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Lấy tất cả chuyến xe với thông tin đầy đủ (cho StudentCard)
exports.getAllTripsWithDetails = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cx.maChuyenXe,
        cx.maXeBuyt,
        cx.maTaiXe,
        cx.maLichTrinh,
        cx.maTuyenDuong,
        cx.trangThai,
        xb.bienSoXe,
        tx.tenTaiXe,
        tx.anhTaiXe,
        td.tenTuyenDuong,
        lt.ngay,
        lt.thoiGianDi,
        lt.thoiGianDen
      FROM chuyenxe cx
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      ORDER BY lt.ngay DESC, lt.thoiGianDi ASC
      LIMIT 50
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi getAllTripsWithDetails:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Helper function - Lấy phân bổ của học sinh (ĐƠN GIẢN HÓA)
exports.getStudentAllocations = (maHocSinh) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT pbhst.*, dd.tenDiemDung
      FROM phanbohocsinhtram pbhst
      JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
      WHERE pbhst.maHocSinh = ? AND pbhst.trangThai = 'Active'
      LIMIT 10
    `;

    db.query(query, [maHocSinh], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Helper function - Lấy chuyến xe của học sinh (ĐƠN GIẢN HÓA)
exports.getStudentTrips = (maHocSinh) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT
        cx.maChuyenXe,
        cx.trangThai,
        xb.bienSoXe,
        tx.tenTaiXe,
        td.tenTuyenDuong,
        lt.thoiGianDi,
        lt.thoiGianDen
      FROM phanbohocsinhtram pbhst
      JOIN chuyenxe cx ON pbhst.maChuyenXe = cx.maChuyenXe
      JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      WHERE pbhst.maHocSinh = ? AND pbhst.trangThai = 'Active'
      LIMIT 10
    `;

    db.query(query, [maHocSinh], (err, results) => {
      if (err) {
        console.error("❌ Lỗi getStudentTrips:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};