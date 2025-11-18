const createDriver = (req, res) => {
  console.log("🔥 ===== CREATE DRIVER CALLED =====");
  console.log("📥 Create Driver - Body:", req.body);
  console.log("📥 Create Driver - Files:", req.files);

  const { tenTaiXe, ngaySinh, soDienThoai, soBangLai, trangThai } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!tenTaiXe || !soDienThoai || !soBangLai) {
    return res.status(400).json({
      success: false,
      error:
        "Thiếu thông tin bắt buộc (tên tài xế, số điện thoại, số bằng lái)",
    });
  }

  let anhTaiXePath = null;

  // Xử lý upload ảnh nếu có (COPY EXACT từ studentController)
  if (req.files && req.files.anhTaiXe) {
    const anhTaiXe = req.files.anhTaiXe;

    // Tạo thư mục nếu chưa tồn tại
    const uploadDir = path.join(__dirname, "../public/images/drivers");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Tạo tên file mới
    const fileExtension = path.extname(anhTaiXe.name);
    const fileName = `driver_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    console.log("📁 Upload dir:", uploadDir);
    console.log("📁 File path:", filePath);

    // Lưu file
    anhTaiXe.mv(filePath, (mvErr) => {
      if (mvErr) {
        console.error("❌ Lỗi khi lưu file:", mvErr);
        return res.status(500).json({
          success: false,
          error: "Lỗi khi upload ảnh",
        });
      }

      console.log("✅ Ảnh đã được lưu thành công:", filePath);
      anhTaiXePath = `/images/drivers/${fileName}`;
      saveDriverToDatabase();
    });
  } else {
    // Không có ảnh, lưu luôn
    saveDriverToDatabase();
  }

  function saveDriverToDatabase() {
    const newDriver = {
      tenTaiXe,
      ngaySinh,
      anhTaiXe: anhTaiXePath,
      soDienThoai,
      soBangLai,
      trangThai: trangThai || "Active",
    };

    console.log("📤 Dữ liệu gửi đến service:", newDriver);

    driverService.addDriver(newDriver, (err, result) => {
      if (err) {
        console.error("🚨 Lỗi trong API:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi server khi thêm tài xế",
          errorDetail: err,
        });
      }

      // ⛔ Nếu username tồn tại → trả exists cho frontend
      if (result.exists) {
        return res.json({ exists: true });
      }

      // ✅ Nếu thêm thành công
      res.json({
        success: true,
        message: "Thêm thành công",
        id: result.taiXe?.insertId,
      });
    });
  }
};
