const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    debug: false,
  })
);

// PHỤC VỤ FILE TĨNH
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/buses", require("./routes/busRoutes")); // Quản lý xe
app.use("/api/tracking", require("./routes/trackingRoutes")); // THEO DÕI VỊ TRÍ XE - MỚI
app.use("/api/routes", require("./routes/routeRoutes")); // Quản lý tuyến đường

// Route mặc định để test
app.get("/", (req, res) => {
  res.json({ message: "Backend đang chạy!" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API đang hoạt động!" });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: "Route không tồn tại" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📊 URL: http://localhost:${PORT}`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🎓 Students API: http://localhost:${PORT}/api/students`);
  console.log(`🚌 Buses API: http://localhost:${PORT}/api/buses`);
  console.log(`📍 Tracking API: http://localhost:${PORT}/api/tracking`); // MỚI
  console.log(`🛣️  Route API: http://localhost:${PORT}/api/routes`); // MỚI
});
