// server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------
// 1️⃣ KẾT NỐI DATABASE
// ---------------------------
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "school_bus_management",
});

app.get("/", (req, res) => {
  res.send("✅ Backend connected successfully to MySQL database school_bus_management");
});

// ---------------------------
// 2️⃣ API ĐĂNG NHẬP
// ---------------------------
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM taiKhoan WHERE tenDangNhap = ? LIMIT 1",
      [username]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

    const user = rows[0];
    if (user.matKhau !== password)
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });

    // ✅ Lấy tên người dùng từ bảng tương ứng
    const [[profile]] = await db.query(
      `SELECT tk.maTaiKhoan, tk.tenDangNhap, tk.capDo,
              COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
       FROM taiKhoan tk
       LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
       LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
       LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
       WHERE tk.maTaiKhoan = ?
       LIMIT 1`,
      [user.maTaiKhoan]
    );

    res.json({
      maTaiKhoan: user.maTaiKhoan,
      tenDangNhap: user.tenDangNhap,
      capDo: user.capDo,
      tenNguoiDung: profile?.tenNguoiDung || null,
    });
  } catch (err) {
    console.error("❌ /api/login error:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ---------------------------
// 3️⃣ TÀI KHOẢN CHI TIẾT
// ---------------------------
app.get("/api/taikhoan/:maTaiKhoan", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tk.*, 
              COALESCE(tx.tenTaiXe, ql.tenQuanLyXe, ph.tenPhuHuynh) AS tenNguoiDung
       FROM taiKhoan tk
       LEFT JOIN taiXe tx ON tk.maTaiKhoan = tx.maTaiKhoan
       LEFT JOIN quanLyXe ql ON tk.maTaiKhoan = ql.maTaiKhoan
       LEFT JOIN phuHuynh ph ON tk.maTaiKhoan = ph.maTaiKhoan
       WHERE tk.maTaiKhoan = ? LIMIT 1`,
      [req.params.maTaiKhoan]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("❌ /api/taikhoan error:", err.message);
    res.status(500).json({ error: "Không thể lấy thông tin tài khoản" });
  }
});

// ---------------------------
// 4️⃣ HỌC SINH, PHỤ HUYNH, PHÂN BỔ
// ---------------------------

app.get("/api/hocsinh", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        hs.maHocSinh,
        hs.tenHocSinh,
        hs.lop,
        hs.anhHocSinh,
        ph.tenPhuHuynh,
        pb.maPhanBoHocSinh,
        pb.maChuyenXe,
        cx.maChuyenXe AS cx_maChuyenXe,
        xb.bienSoXe,
        tx.tenTaiXe,
        tx.anhTaiXe,
        td.tenTuyenDuong,
        lt.thoiGianDi,
        lt.thoiGianDen
      FROM hocSinh hs
      LEFT JOIN phuHuynh ph ON hs.maHocSinh = ph.maHocSinh
      LEFT JOIN phanBoHocSinh pb ON hs.maHocSinh = pb.maHocSinh
      LEFT JOIN chuyenXe cx ON pb.maChuyenXe = cx.maChuyenXe
      LEFT JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      LEFT JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
      LEFT JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
      LEFT JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
      ORDER BY hs.maHocSinh
    `);

    const map = new Map();
    for (const r of rows) {
      const id = r.maHocSinh;
      if (!map.has(id)) {
        map.set(id, {
          maHocSinh: r.maHocSinh,
          tenHocSinh: r.tenHocSinh,
          lop: r.lop,
          anhHocSinh: r.anhHocSinh || null,
          tenPhuHuynh: r.tenPhuHuynh || null,
          trips: []
        });
      }

      // Nếu bản ghi có chuyến (maChuyenXe) -> thêm vào trips
      const maChuyenXe = r.maChuyenXe ?? r.cx_maChuyenXe;
      if (maChuyenXe) {
        const trip = {
          maPhanBo: r.maPhanBo ?? null,
          maChuyenXe: maChuyenXe,
          bienSoXe: r.bienSoXe ?? null,
          tenTaiXe: r.tenTaiXe ?? null,
          anhTaiXe: r.anhTaiXe ?? null,
          tenTuyenDuong: r.tenTuyenDuong ?? null,
          thoiGianDi: r.thoiGianDi ?? null,
          thoiGianDen: r.thoiGianDen ?? null
        };
        const student = map.get(id);
        // tránh push trip trùng (theo maChuyenXe + maPhanBo)
        if (!student.trips.find(t => t.maChuyenXe === trip.maChuyenXe && t.maPhanBo === trip.maPhanBo)) {
          student.trips.push(trip);
        }
      }
    }

    const data = Array.from(map.values());
    res.json(data);
  } catch (err) {
    console.error("❌ /api/hocsinh error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu học sinh" });
  }
});

app.get("/api/phuhuynh", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM phuHuynh");
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/phuhuynh error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu phụ huynh" });
  }
});

app.get("/api/phanbohocsinh", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pb.*, hs.tenHocSinh, cx.maChuyenXe
      FROM phanBoHocSinh pb
      JOIN hocSinh hs ON pb.maHocSinh = hs.maHocSinh
      JOIN chuyenXe cx ON pb.maChuyenXe = cx.maChuyenXe
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/phanbohocsinh error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu phân bổ học sinh" });
  }
});

// ---------------------------
// 5️⃣ XE, TUYẾN, LỊCH TRÌNH, CHUYẾN
// ---------------------------
app.get("/api/xebuyt", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM xeBuyt");
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/xebuyt error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu xe buýt" });
  }
});

app.get("/api/tuyenduong", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tuyenDuong");
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/tuyenduong error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu tuyến đường" });
  }
});

app.get("/api/lichtrinh", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM lichTrinh");
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/lichtrinh error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu lịch trình" });
  }
});

app.get("/api/chuyenxe", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cx.*, xb.bienSoXe, tx.tenTaiXe, td.tenTuyenDuong, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
      FROM chuyenXe cx
      JOIN xeBuyt xb ON cx.maXeBuyt = xb.maXeBuyt
      JOIN taiXe tx ON cx.maTaiXe = tx.maTaiXe
      JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
      JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/chuyenxe error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu chuyến xe" });
  }
});

// ---------------------------
// 6️⃣ VỊ TRÍ XE
// ---------------------------
app.get("/api/vitrichuyenxe", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT vc.maViTriChuyenXe, vc.maChuyenXe, vt.kinhDo, vt.viDo, vc.thoiGianGhiNhan
      FROM viTriChuyenXe vc
      JOIN viTriThuc vt ON vc.maViTriThuc = vt.maViTriThuc
      ORDER BY vc.thoiGianGhiNhan DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/vitrichuyenxe error:", err.message);
    res.status(500).json({ error: "Không thể lấy vị trí chuyến xe" });
  }
});

// ---------------------------
// 7️⃣ THÔNG BÁO & CẢNH BÁO
// ---------------------------
app.get("/api/thongbao/:maTaiKhoan", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tb.maThongBao, tb.noiDung, tb.thoiGianTao
      FROM thongBao tb
      JOIN chiTietThongBao ct ON tb.maThongBao = ct.maThongBao
      WHERE ct.maTaiKhoan = ?
      ORDER BY tb.thoiGianTao DESC
    `, [req.params.maTaiKhoan]);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/thongbao error:", err.message);
    res.status(500).json({ error: "Không thể lấy thông báo" });
  }
});

app.get("/api/canhbao", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cb.maCanhBao, cb.noiDung, cb.thoiGianTao, tx.tenTaiXe
      FROM canhBao cb
      LEFT JOIN taiXe tx ON cb.maTaiXe = tx.maTaiXe
      ORDER BY cb.thoiGianTao DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/canhbao error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu cảnh báo" });
  }
});
app.get("/api/taixe", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tx.*, tk.tenDangNhap
      FROM taiXe tx
      LEFT JOIN taiKhoan tk ON tx.maTaiKhoan = tk.maTaiKhoan
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ /api/taixe error:", err.message);
    res.status(500).json({ error: "Không thể lấy dữ liệu tài xế" });
  }
});

// ---------------------------
// 8️⃣ CHẠY SERVER
// ---------------------------
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);