const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục tồn tại
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`✅ Đã tạo thư mục: ${directory}`);
  }
};

// Cấu hình lưu trữ file cho tài xế
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/uploads/drivers/";
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "driver-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Lọc file ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware xử lý lỗi multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File quá lớn (tối đa 5MB)" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Field name không đúng" });
    }
    return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Route upload ảnh tài xế
router.post(
  "/driver",
  upload.single("image"),
  handleMulterError,
  (req, res) => {
    try {
      console.log("📨 Nhận request upload:", {
        file: req.file
          ? {
              name: req.file.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
            }
          : "No file",
      });

      if (!req.file) {
        return res.status(400).json({ message: "Không có file được upload" });
      }

      // Trả về đường dẫn theo format bạn muốn
      const imageUrl = `/images/drivers/${req.file.filename}`;

      console.log("✅ Upload thành công:", imageUrl);

      res.json({
        message: "Upload ảnh thành công",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Lỗi upload:", error);
      res.status(500).json({ message: "Lỗi server khi upload ảnh" });
    }
  }
);

module.exports = router;
