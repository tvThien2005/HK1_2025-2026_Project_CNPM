const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // đổi theo user MySQL của bạn
  password: "", // nếu có password thì điền vào
  database: "bus_tracking",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Kết nối MySQL thành công");
});

// 📌 GET: Lấy toàn bộ xe buýt
app.get("/api/xe", (req, res) => {
  db.query("SELECT * FROM xebuyt", (err, results) => {
    if (err) return res.status(500).json(err);

    // Map sang đúng format frontend cần
    const xe = results.map((row) => ({
      id: row.id,
      name: row.ten,
      type: row.loaiXe,
      cap: row.sucChua,
    }));

    res.json(xe);
  });
});

// 📌 POST: Thêm xe buýt
app.post("/api/xe", (req, res) => {
  const { name, type, cap } = req.body;
  db.query(
    "INSERT INTO xebuyt (ten, loaiXe, sucChua) VALUES (?, ?, ?)",
    [name, type, cap],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: result.insertId, name, type, cap });
    }
  );
});

// 📌 PUT: Cập nhật xe buýt
app.put("/api/xe/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, cap } = req.body;
  db.query(
    "UPDATE xebuyt SET ten=?, loaiXe=?, sucChua=? WHERE id=?",
    [name, type, cap, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ id, name, type, cap });
    }
  );
});

// 📌 DELETE: Xóa xe buýt
app.delete("/api/xe/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM xebuyt WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Xóa thành công" });
  });
});
app.listen(PORT, () => {
  console.log(`🚀 Backend chạy tại http://localhost:${PORT}`);
});
// API để lấy danh sách xe
app.get("/api/vehicles", (req, res) => {
  const sql = "SELECT id, license_plate, assigned_driver_id FROM vehicles";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("Lỗi máy chủ");
    res.json(results);
  });
});

// API để lấy danh sách tài xế
app.get("/api/drivers", (req, res) => {
  const sql = "SELECT id, name FROM drivers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("Lỗi máy chủ");
    res.json(results);
  });
});

// API để phân công tài xế cho xe
app.post("/api/vehicles/assign-driver", (req, res) => {
  const { vehicleId, driverId } = req.body;
  const sql = "UPDATE vehicles SET assigned_driver_id = ? WHERE id = ?";
  db.query(sql, [driverId, vehicleId], (err, result) => {
    if (err) return res.status(500).send("Lỗi máy chủ");
    res.json({ message: "Phân công tài xế thành công" });
  });
});
