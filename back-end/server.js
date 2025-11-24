// // server.js
// import express from "express";
// import cors from "cors";
// import mysql from "mysql2/promise";
// import path from "path";
// import { dirname } from "path";
// import trackingRoutes from "./routes/trackingRoutes.js";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')))
// // // ---------------------------
// // // 1️⃣ KẾT NỐI DATABASE
// // // ---------------------------
// // const db = await mysql.createConnection({
// //   host: "localhost",
// //   user: "root",
// //   password: "",
// //   database: "school_bus_management",
// // });

// // app.get("/", (req, res) => {
// //   res.send("✅ Backend connected successfully to MySQL database school_bus_management");
// // });

// // // ---------------------------
// // // 2️⃣ API ĐĂNG NHẬP
// // // ---------------------------
// // app.post("/api/login", async (req, res) => {
// //   const { username, password } = req.body;
// //   try {
// //     const [rows] = await db.query(
// //       "SELECT * FROM taikhoan WHERE tenDangNhap = ? LIMIT 1",
// //       [username]
// //     );
// //     if (!rows.length)
// //       return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

// //     const user = rows[0];
// //     if (user.matKhau !== password)
// //       return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

// //     // ✅ Lấy tên người dùng từ bảng tương ứng
// //     const [[profile]] = await db.query(
// //       `SELECT tk.maTaiKhoan, tk.tenDangNhap, tk.capDo, tk.trangThai, tk.block,
// //               COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
// //        FROM taikhoan tk
// //        LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
// //        LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
// //        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
// //        WHERE tk.maTaiKhoan = ?
// //        LIMIT 1`,
// //       [user.maTaiKhoan]
// //     );

// //     res.json({
// //       maTaiKhoan: user.maTaiKhoan,
// //       tenDangNhap: user.tenDangNhap,
// //       capDo: user.capDo,
// //       trangThai: user.trangThai,
// //       block : user.block,
// //       tenNguoiDung: profile?.tenNguoiDung || null,
// //     });
// //   } catch (err) {
// //     console.error("❌ /api/login error:", err.message);
// //     res.status(500).json({ error: "Lỗi server" });
// //   }
// // });

// // // ---------------------------
// // // 3️⃣ TÀI KHOẢN CHI TIẾT
// // // ---------------------------
// // app.get("/api/taikhoan/:maTaiKhoan", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(
// //       `SELECT tk.*, 
// //               COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
// //        FROM taiKhoan tk
// //        LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
// //        LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
// //        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
// //        WHERE tk.maTaiKhoan = ? LIMIT 1`,
// //       [req.params.maTaiKhoan]
// //     );
// //     res.json(rows[0] || null);
// //   } catch (err) {
// //     console.error("❌ /api/taikhoan error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy thông tin tài khoản" });
// //   }
// // });

// // // ---------------------------
// // // 4️⃣ HỌC SINH, PHỤ HUYNH, PHÂN BỔ
// // // ---------------------------

// // app.get("/api/hocsinh", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT
// //         hs.maHocSinh,
// //         hs.tenHocSinh,
// //         hs.lop,
// //         hs.anhHocSinh,
// //         ph.tenPhuHuynh,
// //         pb.maPhanBoHocSinh,
// //         pb.maChuyenXe,
// //         cx.maChuyenXe AS cx_maChuyenXe,
// //         xb.bienSoXe,
// //         tx.tenTaiXe,
// //         tx.anhTaiXe,
// //         td.tenTuyenDuong,
// //         lt.thoiGianDi,
// //         lt.thoiGianDen
// //       FROM hocSinh hs
// //       LEFT JOIN phuHuynh ph ON hs.maHocSinh = ph.maHocSinh
// //       LEFT JOIN phanBoHocSinh pb ON hs.maHocSinh = pb.maHocSinh
// //       LEFT JOIN chuyenXe cx ON pb.maChuyenXe = cx.maChuyenXe
// //       LEFT JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
// //       LEFT JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
// //       LEFT JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
// //       LEFT JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
// //       ORDER BY hs.maHocSinh
// //     `);

// //     const map = new Map();
// //     for (const r of rows) {
// //       const id = r.maHocSinh;
// //       if (!map.has(id)) {
// //         map.set(id, {
// //           maHocSinh: r.maHocSinh,
// //           tenHocSinh: r.tenHocSinh,
// //           lop: r.lop,
// //           anhHocSinh: r.anhHocSinh || null,
// //           tenPhuHuynh: r.tenPhuHuynh || null,
// //           trips: []
// //         });
// //       }

// //       // Nếu bản ghi có chuyến (maChuyenXe) -> thêm vào trips
// //       const maChuyenXe = r.maChuyenXe ?? r.cx_maChuyenXe;
// //       if (maChuyenXe) {
// //         const trip = {
// //           maPhanBo: r.maPhanBo ?? null,
// //           maChuyenXe: maChuyenXe,
// //           bienSoXe: r.bienSoXe ?? null,
// //           tenTaiXe: r.tenTaiXe ?? null,
// //           anhTaiXe: r.anhTaiXe ?? null,
// //           tenTuyenDuong: r.tenTuyenDuong ?? null,
// //           thoiGianDi: r.thoiGianDi ?? null,
// //           thoiGianDen: r.thoiGianDen ?? null
// //         };
// //         const student = map.get(id);
// //         // tránh push trip trùng (theo maChuyenXe + maPhanBo)
// //         if (!student.trips.find(t => t.maChuyenXe === trip.maChuyenXe && t.maPhanBo === trip.maPhanBo)) {
// //           student.trips.push(trip);
// //         }
// //       }
// //     }

// //     const data = Array.from(map.values());
// //     res.json(data);
// //   } catch (err) {
// //     console.error("❌ /api/hocsinh error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu học sinh" });
// //   }
// // });

// // app.get("/api/phuhuynh", async (req, res) => {
// //   try {
// //     const [rows] = await db.query("SELECT * FROM phuHuynh");
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/phuhuynh error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu phụ huynh" });
// //   }
// // });

// // app.get("/api/phanbohocsinh", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT pb.*, hs.tenHocSinh, cx.maChuyenXe
// //       FROM phanBoHocSinh pb
// //       JOIN hocSinh hs ON pb.maHocSinh = hs.maHocSinh
// //       JOIN chuyenXe cx ON pb.maChuyenXe = cx.maChuyenXe
// //     `);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/phanbohocsinh error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu phân bổ học sinh" });
// //   }
// // });

// // // ---------------------------
// // // 5️⃣ XE, TUYẾN, LỊCH TRÌNH, CHUYẾN
// // // ---------------------------
// // app.get("/api/xebuyt", async (req, res) => {
// //   try {
// //     const [rows] = await db.query("SELECT * FROM xeBuyt");
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/xebuyt error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu xe buýt" });
// //   }
// // });

// // app.get("/api/tuyenduong", async (req, res) => {
// //   try {
// //     const [rows] = await db.query("SELECT * FROM tuyenDuong");
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/tuyenduong error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu tuyến đường" });
// //   }
// // });

// // app.get("/api/lichtrinh", async (req, res) => {
// //   try {
// //     const [rows] = await db.query("SELECT * FROM lichTrinh");
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/lichtrinh error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu lịch trình" });
// //   }
// // });

// // app.get("/api/chuyenxe", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
// //       FROM chuyenXe cx
// //       JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
// //       JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
// //       JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
// //       JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
// //     `);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/chuyenxe error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu chuyến xe" });
// //   }
// // });

// // app.put('/api/chuyenxe/:maChuyenXe/status', async (req, res) => {
// //   try {
// //     const { maChuyenXe } = req.params;
// //     const { trangThai } = req.body;

// //     if (!trangThai || !['InProgress', 'Completed', 'Scheduled'].includes(trangThai)) {
// //       return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
// //     }

// //     const [result] = await db.execute(
// //       'UPDATE chuyenxe SET trangThai = ? WHERE maChuyenXe = ?',
// //       [trangThai, maChuyenXe]
// //     );

// //     if (result.affectedRows === 0) {
// //       return res.status(404).json({ error: 'Không tìm thấy chuyến xe' });
// //     }

// //     res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
// //   } catch (error) {
// //     console.error('Lỗi cập nhật trạng thái chuyến xe:', error);
// //     res.status(500).json({ error: 'Lỗi server' });
// //   }
// // });

// // // ---------------------------
// // // 6️⃣ VỊ TRÍ XE
// // // ---------------------------
// // app.get("/api/vitrichuyenxe", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT vc.maViTriChuyenXe, vc.maChuyenXe, vt.kinhDo, vt.viDo, vc.thoiGianGhiNhan
// //       FROM viTriChuyenXe vc
// //       JOIN viTriThuc vt ON vc.maViTriThuc = vt.maViTriThuc
// //       ORDER BY vc.thoiGianGhiNhan DESC
// //     `);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/vitrichuyenxe error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy vị trí chuyến xe" });
// //   }
// // });

// // // ---------------------------
// // // 7️⃣ THÔNG BÁO & CẢNH BÁO
// // // ---------------------------
// // app.get("/api/thongbao/:maTaiKhoan", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT tb.maThongBao, tb.noiDung, tb.thoiGianTao
// //       FROM thongBao tb
// //       JOIN chiTietThongBao ct ON tb.maThongBao = ct.maThongBao
// //       WHERE ct.maTaiKhoan = ?
// //       ORDER BY tb.thoiGianTao DESC
// //     `, [req.params.maTaiKhoan]);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/thongbao error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy thông báo" });
// //   }
// // });

// // app.get("/api/canhbao", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT cb.maCanhBao, cb.noiDung, cb.thoiGianTao, tx.tenTaiXe
// //       FROM canhBao cb
// //       LEFT JOIN taiXe tx ON cb.maTaiXe = tx.maTaiXe
// //       ORDER BY cb.thoiGianTao DESC
// //     `);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/canhbao error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu cảnh báo" });
// //   }
// // });
// // app.get("/api/taixe", async (req, res) => {
// //   try {
// //     const [rows] = await db.query(`
// //       SELECT tx.*, tk.tenDangNhap
// //       FROM taiXe tx
// //       LEFT JOIN taiKhoan tk ON tx.maTaiKhoan = tk.maTaiKhoan
// //     `);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("❌ /api/taixe error:", err.message);
// //     res.status(500).json({ error: "Không thể lấy dữ liệu tài xế" });
// //   }
// // });

// // app.get('/api/phuhuynh/:maTaiKhoan/hocsinh', async (req, res) => {
// //   try {
// //     // Lấy maTaiKhoan từ tham số đường dẫn
// //     const maTaiKhoanPhuHuynh = req.params.maTaiKhoan;

// //     // Tối ưu hóa câu truy vấn: Chỉ cần lấy thông tin học sinh,
// //     // tránh lấy toàn bộ cột (ph.*) của bảng phuHuynh vì nó đã được lọc theo maTaiKhoan.
// //     const query = `
// //       SELECT
// //         hs.maHocSinh,
// //         hs.tenHocSinh
// //       FROM
// //         phuHuynh ph
// //       JOIN
// //         hocSinh hs ON ph.maHocSinh = hs.maHocSinh
// //       WHERE
// //         ph.maTaiKhoan = ?
// //     `;

// //     // Thực thi truy vấn, sử dụng maTaiKhoanPhuHuynh làm giá trị cho placeholder (?)
// //     const [rows] = await db.query(query, [maTaiKhoanPhuHuynh]);

// //     // Trả về dữ liệu
// //     res.json(rows);

// //   } catch (err) {
// //     // Ghi log lỗi chi tiết
// //     console.error("❌ Lỗi API /api/phuhuynh/:maTaiKhoan/hocsinh:", err.message);
    
// //     // Trả về lỗi 500 cho client
// //     res.status(500).json({ error: "Không thể lấy dữ liệu học sinh của phụ huynh" });
// //   }
// // });

// // app.post('/api/notifications/pickup', async (req, res) => {
// //   try {
// //     const { maHocSinh, maChuyenXe, tenHocSinh, tenTaiXe, bienSoXe } = req.body;
    
// //     // Lấy mã phụ huynh từ học sinh
// //     const [phuHuynh] = await db.execute(
// //       'SELECT maPhuHuynh FROM phuhuynh WHERE maHocSinh = ?',
// //       [maHocSinh]
// //     );

// //     if (phuHuynh.length === 0) {
// //       return res.status(404).json({ error: 'Không tìm thấy phụ huynh' });
// //     }

// //     const maPhuHuynh = phuHuynh[0].maPhuHuynh;

// //     // Tạo thông báo
// //     const [thongBaoResult] = await db.execute(
// //       'INSERT INTO thongbao (maQuanLyXe, noiDung, thoiGianTao) VALUES (?, ?, NOW())',
// //       [1, `Học sinh ${tenHocSinh} đã được xe ${bienSoXe} (tài xế ${tenTaiXe}) đón thành công`]
// //     );

// //     const maThongBao = thongBaoResult.insertId;

// //     // Gán thông báo cho phụ huynh
// //     await db.execute(
// //       'INSERT INTO chitietthongbao (maThongBao, maTaiKhoan) VALUES (?, ?)',
// //       [maThongBao, maPhuHuynh]
// //     );

// //     res.json({ success: true, message: 'Thông báo đã được gửi' });
// //   } catch (error) {
// //     console.error('Lỗi tạo thông báo:', error);
// //     res.status(500).json({ error: 'Lỗi server' });
// //   }
// // });

// // ---------------------------
// // 1️⃣ KẾT NỐI DATABASE
// // ---------------------------
// const db = await mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "school_bus_management",
// });

// app.get("/", (req, res) => {
//   res.send("✅ Backend connected successfully to MySQL database school_bus_management");
// });

// // ---------------------------
// // 2️⃣ API ĐĂNG NHẬP (GIỮ NGUYÊN)
// // ---------------------------
// app.post("/api/login", async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM taikhoan WHERE tenDangNhap = ? LIMIT 1",
//       [username]
//     );
//     if (!rows.length)
//       return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

//     const user = rows[0];
//     if (user.matKhau !== password)
//       return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

//     const [[profile]] = await db.query(
//       `SELECT tk.maTaiKhoan, tk.tenDangNhap, tk.capDo, tk.trangThai, tk.block,
//               COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
//        FROM taikhoan tk
//        LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
//        LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
//        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//        WHERE tk.maTaiKhoan = ?
//        LIMIT 1`,
//       [user.maTaiKhoan]
//     );

//     res.json({
//       maTaiKhoan: user.maTaiKhoan,
//       tenDangNhap: user.tenDangNhap,
//       capDo: user.capDo,
//       trangThai: user.trangThai,
//       block : user.block,
//       tenNguoiDung: profile?.tenNguoiDung || null,
//     });
//   } catch (err) {
//     console.error("❌ /api/login error:", err.message);
//     res.status(500).json({ error: "Lỗi server" });
//   }
// });

// // ---------------------------
// // 3️⃣ HỌC SINH - CẬP NHẬT THEO DATABASE MỚI
// // ---------------------------
// app.get("/api/hocsinh", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
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
//       FROM hocSinh hs
//       LEFT JOIN diachi dc ON hs.maDiaChi = dc.maDiaChi
//       LEFT JOIN vitrithuc vt ON dc.maViTriThuc = vt.maViTriThuc
//       WHERE hs.trangThai = 'Active'
//       ORDER BY hs.maHocSinh
//     `);

//     // Lấy thông tin phân bố trạm và chuyến xe cho mỗi học sinh
//     const studentsWithTrips = await Promise.all(
//       rows.map(async (student) => {
//         // Lấy phân bố trạm của học sinh
//         const [allocations] = await db.query(`
//           SELECT pbhst.*, 
//                  dd.tenDiemDung,
//                  dd.maViTriThuc,
//                  vt.kinhDo as stopKinhDo,
//                  vt.viDo as stopViDo
//           FROM phanbohocsinhtram pbhst
//           JOIN diemdung dd ON pbhst.maDiemDung = dd.maDiemDung
//           JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//           WHERE pbhst.maHocSinh = ? AND pbhst.trangThai = 'Active'
//         `, [student.maHocSinh]);

//         // Lấy chuyến xe thông qua phân bố trạm xe
//         const trips = [];
//         for (const alloc of allocations) {
//           const [busAllocations] = await db.query(`
//             SELECT pbtx.*,
//                    cx.maChuyenXe,
//                    cx.maXeBuyt,
//                    cx.maTaiXe,
//                    cx.maLichTrinh,
//                    cx.maTuyenDuong,
//                    cx.trangThai as chuyenTrangThai,
//                    xb.bienSoXe,
//                    tx.tenTaiXe,
//                    tx.anhTaiXe,
//                    td.tenTuyenDuong,
//                    lt.ngay,
//                    lt.thoiGianDi,
//                    lt.thoiGianDen
//             FROM phanbotramxe pbtx
//             JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
//             JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//             JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//             JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
//             JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//             WHERE pbtx.maDiemDung = ? AND pbtx.trangThai = 'Active'
//           `, [alloc.maDiemDung]);

//           trips.push(...busAllocations);
//         }

//         return {
//           ...student,
//           trips: trips.map(trip => ({
//             maChuyenXe: trip.maChuyenXe,
//             bienSoXe: trip.bienSoXe,
//             tenTaiXe: trip.tenTaiXe,
//             anhTaiXe: trip.anhTaiXe,
//             tenTuyenDuong: trip.tenTuyenDuong,
//             thoiGianDi: trip.thoiGianDi,
//             thoiGianDen: trip.thoiGianDen,
//             ngay: trip.ngay,
//             trangThai: trip.chuyenTrangThai
//           }))
//         };
//       })
//     );

//     res.json(studentsWithTrips);
//   } catch (err) {
//     console.error("❌ /api/hocsinh error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu học sinh" });
//   }
// });

// // ---------------------------
// // 4️⃣ API MỚI CHO PHÂN BỐ TRẠM
// // ---------------------------

// // Lấy phân bố học sinh trạm
// app.get("/api/phanbohocsinhtram", async (req, res) => {
//   try {
//     const { maHocSinh, maDiemDung, maChuyenXe } = req.query;
    
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
    
//     // Nếu có maChuyenXe, tìm qua bảng phanbotramxe
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
    
//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbohocsinhtram error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bố học sinh trạm" });
//   }
// });

// // Lấy phân bố trạm xe
// app.get("/api/phanbotramxe", async (req, res) => {
//   try {
//     const { maDiemDung, maChuyenXe } = req.query;
    
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
    
//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbotramxe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bố trạm xe" });
//   }
// });

// // ---------------------------
// // 5️⃣ ĐIỂM DỪNG VÀ TUYẾN ĐƯỜNG
// // ---------------------------

// // Lấy điểm dừng
// app.get("/api/diemdung", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT dd.*, vt.kinhDo, vt.viDo
//       FROM diemdung dd
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE dd.trangThai = 'Active'
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/diemdung error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu điểm dừng" });
//   }
// });

// // Lấy chi tiết tuyến đường
// app.get("/api/chitiettuyenduong", async (req, res) => {
//   try {
//     const { maTuyenDuong } = req.query;
    
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
    
//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/chitiettuyenduong error:", err.message);
//     res.status(500).json({ error: "Không thể lấy chi tiết tuyến đường" });
//   }
// });

// // ---------------------------
// // 6️⃣ XE, TUYẾN, LỊCH TRÌNH, CHUYẾN (CẬP NHẬT)
// // ---------------------------
// app.get("/api/xebuyt", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM xeBuyt");
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/xebuyt error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu xe buýt" });
//   }
// });

// app.get("/api/tuyenduong", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM tuyenDuong");
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/tuyenduong error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu tuyến đường" });
//   }
// });

// app.get("/api/lichtrinh", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM lichTrinh");
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/lichtrinh error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu lịch trình" });
//   }
// });

// // API chuyến xe - CẬP NHẬT
// app.get("/api/chuyenxe", async (req, res) => {
//   try {
//     const { status } = req.query;
    
//     let whereClause = "";
//     if (status) {
//       whereClause = `WHERE cx.trangThai = '${status}'`;
//     }
    
//     const [rows] = await db.query(`
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenXe cx
//       JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       ${whereClause}
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/chuyenxe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu chuyến xe" });
//   }
// });

// // API lấy chuyến xe theo ID
// app.get("/api/chuyenxe/:maChuyenXe", async (req, res) => {
//   try {
//     const { maChuyenXe } = req.params;
    
//     const [rows] = await db.query(`
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenXe cx
//       JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE cx.maChuyenXe = ?
//     `, [maChuyenXe]);
    
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Không tìm thấy chuyến xe" });
//     }
    
//     res.json(rows[0]);
//   } catch (err) {
//     console.error("❌ /api/chuyenxe/:maChuyenXe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu chuyến xe" });
//   }
// });

// app.put('/api/chuyenxe/:maChuyenXe/status', async (req, res) => {
//   try {
//     const { maChuyenXe } = req.params;
//     const { trangThai } = req.body;

//     if (!trangThai || !['InProgress', 'Completed', 'Scheduled'].includes(trangThai)) {
//       return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
//     }

//     const [result] = await db.execute(
//       'UPDATE chuyenxe SET trangThai = ? WHERE maChuyenXe = ?',
//       [trangThai, maChuyenXe]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Không tìm thấy chuyến xe' });
//     }

//     res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
//   } catch (error) {
//     console.error('Lỗi cập nhật trạng thái chuyến xe:', error);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// });

// // ---------------------------
// // 7️⃣ VỊ TRÍ XE
// // ---------------------------
// app.get("/api/vitrichuyenxe", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT vc.maViTriChuyenXe, vc.maChuyenXe, vt.kinhDo, vt.viDo, vc.thoiGianGhiNhan
//       FROM viTriChuyenXe vc
//       JOIN viTriThuc vt ON vc.maViTriThuc = vt.maViTriThuc
//       ORDER BY vc.thoiGianGhiNhan DESC
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/vitrichuyenxe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy vị trí chuyến xe" });
//   }
// });

// // ---------------------------
// // 8️⃣ THÔNG BÁO & CẢNH BÁO (GIỮ NGUYÊN)
// // ---------------------------
// app.get("/api/thongbao/:maTaiKhoan", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT tb.maThongBao, tb.noiDung, tb.thoiGianTao
//       FROM thongBao tb
//       JOIN chiTietThongBao ct ON tb.maThongBao = ct.maThongBao
//       WHERE ct.maTaiKhoan = ?
//       ORDER BY tb.thoiGianTao DESC
//     `, [req.params.maTaiKhoan]);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/thongbao error:", err.message);
//     res.status(500).json({ error: "Không thể lấy thông báo" });
//   }
// });

// app.get("/api/canhbao", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT cb.maCanhBao, cb.noiDung, cb.thoiGianTao, tx.tenTaiXe
//       FROM canhBao cb
//       LEFT JOIN taiXe tx ON cb.maTaiXe = tx.maTaiXe
//       ORDER BY cb.thoiGianTao DESC
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/canhbao error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu cảnh báo" });
//   }
// });

// app.get("/api/taixe", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT tx.*, tk.tenDangNhap
//       FROM taiXe tx
//       LEFT JOIN taiKhoan tk ON tx.maTaiKhoan = tk.maTaiKhoan
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/taixe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu tài xế" });
//   }
// });

// // ---------------------------
// // 9️⃣ PHỤ HUYNH VÀ HỌC SINH
// // ---------------------------
// app.get("/api/phuhuynh", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT ph.*, hs.tenHocSinh, hs.lop
//       FROM phuHuynh ph
//       JOIN hocSinh hs ON ph.maHocSinh = hs.maHocSinh
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phuhuynh error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phụ huynh" });
//   }
// });

// app.get('/api/phuhuynh/:maTaiKhoan/hocsinh', async (req, res) => {
//   try {
//     const maTaiKhoanPhuHuynh = req.params.maTaiKhoan;

//     const query = `
//       SELECT
//         hs.maHocSinh,
//         hs.tenHocSinh,
//         hs.lop,
//         hs.anhHocSinh
//       FROM
//         phuHuynh ph
//       JOIN
//         hocSinh hs ON ph.maHocSinh = hs.maHocSinh
//       WHERE
//         ph.maTaiKhoan = ?
//     `;

//     const [rows] = await db.query(query, [maTaiKhoanPhuHuynh]);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ Lỗi API /api/phuhuynh/:maTaiKhoan/hocsinh:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu học sinh của phụ huynh" });
//   }
// });

// // ---------------------------
// // 🔟 THÔNG TIN TÀI KHOẢN (GIỮ NGUYÊN)
// // ---------------------------
// app.get("/api/taikhoan/:maTaiKhoan", async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT tk.*, 
//               COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
//        FROM taiKhoan tk
//        LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
//        LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
//        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//        WHERE tk.maTaiKhoan = ? LIMIT 1`,
//       [req.params.maTaiKhoan]
//     );
//     res.json(rows[0] || null);
//   } catch (err) {
//     console.error("❌ /api/taikhoan error:", err.message);
//     res.status(500).json({ error: "Không thể lấy thông tin tài khoản" });
//   }
// });

// app.get("/api/infoAccount/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = Number(req.params.maTaiKhoan);

//   try {
//     const [rows] = await db.query(
//       `SELECT tk.maTaiKhoan,
//               tk.tenDangNhap,
//               tk.matKhau,
//               tk.capDo,
//               tk.trangThai,
//               tk.ngayTao AS createdAt,
//               ph.tenPhuHuynh AS fullName,
//               ph.soDienThoai AS phone,
//               ph.ngaySinh AS dob
//        FROM taiKhoan tk
//        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//        WHERE tk.maTaiKhoan = ? LIMIT 1`,
//       [maTaiKhoan]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         status: "not_found",
//         message: "Không tìm thấy tài khoản phụ huynh",
//       });
//     }

//     return res.status(200).json({
//       status: "success",
//       data: rows[0],
//     });

//   } catch (err) {
//     console.error("❌ Lỗi API:", err.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Lỗi server: Không thể lấy thông tin tài khoản",
//     });
//   }
// });

// app.put("/api/infoAccount/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = req.params.maTaiKhoan;
//   const { fullName, phone, dob, tenDangNhap, password } = req.body;

//   try {
//     await db.beginTransaction();

//     await db.query(
//       `UPDATE phuhuynh 
//        SET tenPhuHuynh = ?, soDienThoai = ?, ngaySinh = ?
//        WHERE maTaiKhoan = ?`,
//       [fullName, phone, dob, maTaiKhoan]
//     );

//     await db.query(
//       `UPDATE taikhoan 
//        SET tenDangNhap = ?, matKhau = ?
//        WHERE maTaiKhoan = ?`,
//       [tenDangNhap, password, maTaiKhoan]
//     );

//     await db.commit();
//     res.json({ status: "success" });

//   } catch (err) {
//     await db.rollback();
//     console.error("❌ Lỗi update:", err.message);
//     res.status(500).json({ status: "error", message: err.message });
//   }
// });

// // ---------------------------
// // 11️⃣ LỊCH SỬ ĐI HỌC - CẬP NHẬT
// // ---------------------------
// app.get("/api/lichsu/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = Number(req.params.maTaiKhoan);

//   try {
//     const [rows] = await db.query(`
//       SELECT DISTINCT lt.ngay, hs.tenHocSinh, lt.thoiGianDi AS morning, lt.thoiGianDen AS afternoon
//       FROM taikhoan tk
//       JOIN phuhuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//       JOIN hocSinh hs ON ph.maHocSinh = hs.maHocSinh
//       JOIN phanbohocsinhtram pbhst ON hs.maHocSinh = pbhst.maHocSinh
//       JOIN phanbotramxe pbtx ON pbhst.maDiemDung = pbtx.maDiemDung
//       JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE tk.maTaiKhoan = ?
//       ORDER BY lt.ngay DESC
//     `, [maTaiKhoan]);
    
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/lichsu error:", err.message);
//     res.status(500).json({ error: "Không thể lấy lịch sử đi học" });
//   }
// });

// // ---------------------------
// // 12️⃣ API HỖ TRỢ BẢN ĐỒ
// // ---------------------------

// // Lấy học sinh theo điểm dừng và loại phân bổ
// app.get("/api/hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo", async (req, res) => {
//   try {
//     const { maDiemDung, loaiPhanBo } = req.params;
    
//     const [rows] = await db.query(`
//       SELECT hs.*, pbhst.loaiPhanBo
//       FROM hocsinh hs
//       JOIN phanbohocsinhtram pbhst ON hs.maHocSinh = pbhst.maHocSinh
//       WHERE pbhst.maDiemDung = ? 
//         AND pbhst.loaiPhanBo = ?
//         AND pbhst.trangThai = 'Active'
//         AND hs.trangThai = 'Active'
//     `, [maDiemDung, loaiPhanBo]);
    
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/hocsinh-theo-diemdung error:", err.message);
//     res.status(500).json({ error: "Không thể lấy học sinh theo điểm dừng" });
//   }
// });

// // Lấy chuyến xe theo tuyến đường
// app.get("/api/chuyenxe-theo-tuyen/:maTuyenDuong", async (req, res) => {
//   try {
//     const { maTuyenDuong } = req.params;
    
//     const [rows] = await db.query(`
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE cx.maTuyenDuong = ? AND cx.trangThai = 'InProgress'
//     `, [maTuyenDuong]);
    
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/chuyenxe-theo-tuyen error:", err.message);
//     res.status(500).json({ error: "Không thể lấy chuyến xe theo tuyến" });
//   }
// });

// // ---------------------------
// // 13️⃣ THÔNG BÁO ĐÓN HỌC SINH
// // ---------------------------
// app.post('/api/notifications/pickup', async (req, res) => {
//   try {
//     const { maHocSinh, maChuyenXe, tenHocSinh, tenTaiXe, bienSoXe } = req.body;
    
//     // Lấy mã phụ huynh từ học sinh
//     const [phuHuynh] = await db.execute(
//       'SELECT maPhuHuynh FROM phuhuynh WHERE maHocSinh = ?',
//       [maHocSinh]
//     );

//     if (phuHuynh.length === 0) {
//       return res.status(404).json({ error: 'Không tìm thấy phụ huynh' });
//     }

//     const maPhuHuynh = phuHuynh[0].maPhuHuynh;

//     // Tạo thông báo
//     const [thongBaoResult] = await db.execute(
//       'INSERT INTO thongbao (maQuanLyXe, noiDung, thoiGianTao) VALUES (?, ?, NOW())',
//       [1, `Học sinh ${tenHocSinh} đã được xe ${bienSoXe} (tài xế ${tenTaiXe}) đón thành công`]
//     );

//     const maThongBao = thongBaoResult.insertId;

//     // Gán thông báo cho phụ huynh
//     await db.execute(
//       'INSERT INTO chitietthongbao (maThongBao, maTaiKhoan) VALUES (?, ?)',
//       [maThongBao, maPhuHuynh]
//     );

//     res.json({ success: true, message: 'Thông báo đã được gửi' });
//   } catch (error) {
//     console.error('Lỗi tạo thông báo:', error);
//     res.status(500).json({ error: 'Lỗi server' });
//   }
// });

// // -------------------------------------------
// // 8️⃣ THÔNG TIN TÀI KHOẢN PHỤ HUYNH
// // -------------------------------------------
// app.get("/api/infoAccount/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = Number(req.params.maTaiKhoan); // đảm bảo là số

//   try {
//     const [rows] = await db.query(
//       `SELECT tk.maTaiKhoan,
//               tk.tenDangNhap,
//               tk.matKhau,
//               tk.capDo,
//               tk.trangThai,
//               tk.ngayTao AS createdAt,
//               ph.tenPhuHuynh AS fullName,
//               ph.soDienThoai AS phone,
//               ph.ngaySinh AS dob
//        FROM taiKhoan tk
//        LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//        WHERE tk.maTaiKhoan = ? LIMIT 1`,
//       [maTaiKhoan]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         status: "not_found",
//         message: "Không tìm thấy tài khoản phụ huynh",
//       });
//     }

//     return res.status(200).json({
//       status: "success",
//       data: rows[0],
//     });

//   } catch (err) {
//     console.error("❌ Lỗi API:", err.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Lỗi server: Không thể lấy thông tin tài khoản",
//     });
//   }
// });

// // -------------------------------------------
// // 9️⃣ CẬP NHẬT THÔNG TIN TÀI KHOẢN PHỤ HUYNH
// // -------------------------------------------
// app.put("/api/infoAccount/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = req.params.maTaiKhoan;
//   const { fullName, phone, dob, tenDangNhap, password } = req.body;

//   try {
//     await db.beginTransaction();

//     // UPDATE bảng phuhuynh
//     await db.query(
//       `UPDATE phuhuynh 
//        SET tenPhuHuynh = ?, soDienThoai = ?, ngaySinh = ?
//        WHERE maTaiKhoan = ?`,
//       [fullName, phone, dob, maTaiKhoan]
//     );

//     // UPDATE bảng taikhoan
//     await db.query(
//       `UPDATE taikhoan 
//        SET tenDangNhap = ?, matKhau = ?
//        WHERE maTaiKhoan = ?`,
//       [tenDangNhap, password, maTaiKhoan]
//     );

//     await db.commit();

//     res.json({ status: "success" });

//   } catch (err) {
//     await db.rollback();

//     console.error("❌ Lỗi update:", err.message);
//     res.status(500).json({ status: "error", message: err.message });
//   }
// });

// // -----------------------------------
// // 10️⃣ TRUY XUẤT LỊCH SỬ ĐI HỌC
// // ---------------------------
// app.get("/api/lichsu/:maTaiKhoan", async (req, res) => {
//   const maTaiKhoan = Number(req.params.maTaiKhoan);

//   try {
//     const [rows] = await db.query(`
//       SELECT lt.ngay, hs.tenHocSinh, lt.thoiGianDi AS morning, lt.thoiGianDen AS afternoon
//       FROM taikhoan tk
//       JOIN phuhuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
//       JOIN hocSinh hs ON ph.maHocSinh = hs.maHocSinh
//       JOIN phanbohocsinh pb ON hs.maHocSinh = pb.maHocSinh
//       JOIN chuyenxe cx ON pb.maChuyenXe = cx.maChuyenXe
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE tk.maTaiKhoan = ?
//       ORDER BY lt.ngay DESC
// `, [maTaiKhoan]);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/lichsu error:", err.message);
//     res.status(500).json({ error: "Không thể lấy lịch sử đi học" });
//   }
// });
// // ---------------------------

// app.get("/api/phanbohocsinhtram", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
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
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbohocsinhtram error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bổ học sinh trạm" });
//   }
// });

// // Lấy phân bổ trạm xe
// app.get("/api/phanbotramxe", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
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
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbotramxe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bổ trạm xe" });
//   }
// });

// // Lấy chi tiết tuyến đường
// app.get("/api/chitiettuyenduong", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT cttd.*,
//              dd.tenDiemDung,
//              dd.maViTriThuc,
//              vt.kinhDo,
//              vt.viDo,
//              td.tenTuyenDuong
//       FROM chitiettuyenduong cttd
//       JOIN diemdung dd ON cttd.maDiemDung = dd.maDiemDung
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       JOIN tuyenduong td ON cttd.maTuyenDuong = td.maTuyenDuong
//       ORDER BY cttd.maTuyenDuong, cttd.thuTu
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/chitiettuyenduong error:", err.message);
//     res.status(500).json({ error: "Không thể lấy chi tiết tuyến đường" });
//   }
// });

// // Lấy điểm dừng
// app.get("/api/diemdung", async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT dd.*, vt.kinhDo, vt.viDo
//       FROM diemdung dd
//       JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
//       WHERE dd.trangThai = 'Active'
//     `);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/diemdung error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu điểm dừng" });
//   }
// });

// // Lấy học sinh theo điểm dừng và loại phân bổ (Sang/Chieu)
// app.get("/api/hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo", async (req, res) => {
//   try {
//     const { maDiemDung, loaiPhanBo } = req.params;
    
//     const [rows] = await db.query(`
//       SELECT hs.*, pbhst.loaiPhanBo
//       FROM hocsinh hs
//       JOIN phanbohocsinhtram pbhst ON hs.maHocSinh = pbhst.maHocSinh
//       WHERE pbhst.maDiemDung = ? 
//         AND pbhst.loaiPhanBo = ?
//         AND pbhst.trangThai = 'Active'
//         AND hs.trangThai = 'Active'
//     `, [maDiemDung, loaiPhanBo]);
    
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/hocsinh-theo-diemdung error:", err.message);
//     res.status(500).json({ error: "Không thể lấy học sinh theo điểm dừng" });
//   }
// });

// // Lấy chuyến xe theo tuyến đường và trạng thái
// app.get("/api/chuyenxe-theo-tuyen/:maTuyenDuong", async (req, res) => {
//   try {
//     const { maTuyenDuong } = req.params;
    
//     const [rows] = await db.query(`
//       SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.thoiGianDi, lt.thoiGianDen
//       FROM chuyenxe cx
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
//       JOIN taixe tx ON cx.maTaiXe = tx.maTaiXe
//       JOIN tuyenduong td ON cx.maTuyenDuong = td.maTuyenDuong
//       JOIN lichtrinh lt ON cx.maLichTrinh = lt.maLichTrinh
//       WHERE cx.maTuyenDuong = ? AND cx.trangThai = 'InProgress'
//     `, [maTuyenDuong]);
    
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/chuyenxe-theo-tuyen error:", err.message);
//     res.status(500).json({ error: "Không thể lấy chuyến xe theo tuyến" });
//   }
// });

// app.get("/api/phanbohocsinhtram", async (req, res) => {
//   try {
//     const { maHocSinh, maDiemDung } = req.query;
//     let query = `
//       SELECT pbhst.*, 
//              hs.tenHocSinh,
//              hs.lop,
//              dd.tenDiemDung,
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
    
//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbohocsinhtram error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bố học sinh trạm" });
//   }
// });

// // Lấy phân bố trạm xe theo điểm dừng
// app.get("/api/phanbotramxe", async (req, res) => {
//   try {
//     const { maDiemDung, maChuyenXe } = req.query;
//     let query = `
//       SELECT pbtx.*,
//              dd.tenDiemDung,
//              cx.maChuyenXe,
//              xb.bienSoXe
//       FROM phanbotramxe pbtx
//       JOIN diemdung dd ON pbtx.maDiemDung = dd.maDiemDung
//       JOIN chuyenxe cx ON pbtx.maChuyenXe = cx.maChuyenXe
//       JOIN xebuyt xb ON cx.maXeBuyt = xb.maXeBuyt
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
    
//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ /api/phanbotramxe error:", err.message);
//     res.status(500).json({ error: "Không thể lấy dữ liệu phân bố trạm xe" });
//   }
// });

// app.use("/api/tracking", trackingRoutes);
// // ---------------------------
// // 8️⃣ CHẠY SERVER
// // ---------------------------
// app.listen(PORT, () =>
//   // console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`📊 URL: http://localhost:${PORT}`),
//   console.log(`👥 Users API: http://localhost:${PORT}/api/taikhoan`),
//   console.log(`🎓 Students API: http://localhost:${PORT}/api/hocsinh`),
//   console.log(`🚌 Buses API: http://localhost:${PORT}/api/xebuyt`),
//   console.log(`📍 Tracking API: http://localhost:${PORT}/api/tracking`)
// );

// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

// Import routes
const indexRoutes = require("./routes/indexRoutes");
const infoRoutes = require("./routes/infoRoutes");
const mapRoutes = require("./routes/mapRoutes");
const trackingRoutes = require("./routes/trackingRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection - SỬA LẠI
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "school_bus_management",
});

// Kết nối database và xử lý lỗi
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Database connected successfully");
});

// Export db để các service sử dụng - SỬA LẠI
global.db = db;

// Routes
app.use("/api", indexRoutes);
app.use("/api/account", infoRoutes);
app.use("/api/bus", mapRoutes);
app.use("/api/tracking", trackingRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to MySQL database school_bus_management");
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 URL: http://localhost:${PORT}`);
  console.log(`🎓 Students API: http://localhost:${PORT}/api/hocsinh`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/account`);
  console.log(`🚌 Buses API: http://localhost:${PORT}/api/bus`);
  console.log(`📍 Tracking API: http://localhost:${PORT}/api/tracking`);
});