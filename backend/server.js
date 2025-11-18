const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware - QUAN TRỌNG: XÓA express-fileupload
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CHỈ PHỤC VỤ FILE TĨNH - sửa lại cho đúng
app.use(
  "/images/drivers",
  express.static(path.join(__dirname, "public/uploads/drivers"))
);
app.use(
  "/images/students",
  express.static(path.join(__dirname, "public/uploads/students_images"))
);

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/tracking", require("./routes/trackingRoutes"));
app.use("/api/assignDrivers", require("./routes/assignDriverRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/drivers", require("./routes/driverRoutes"));
app.use("/api/buses", require("./routes/busRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Route mặc định để test
app.get("/", (req, res) => {
  res.json({ message: "Backend đang chạy!" });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: "Route không tồn tại" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📁 Upload path: http://localhost:${PORT}/images/drivers/`);
});
