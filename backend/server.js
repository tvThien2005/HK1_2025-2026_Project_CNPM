const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/assignDrivers", require("./routes/assignDriverRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/drivers", require("./routes/driverRoutes"));

// Route mặc định để test
app.get("/", (req, res) => {
  res.json({ message: "Backend đang chạy!" });
});

// Route cho API test
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
});
