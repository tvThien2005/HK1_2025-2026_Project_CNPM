const driverService = require("../services/driverServices");

const getDriver = (req, res) => {
  driverService.getAllDriver((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const removeDriver = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa user ID:", id);

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  driverService.deleteDriver(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa user:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa",
        errorDetail: err.sqlMessage,
      });
    }

    // Kiểm tra có xóa được bản ghi nào không
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy tài khoản để xóa",
      });
    }

    console.log("✅ Xóa thành công, affected rows:", results.affectedRows);
    res.json({
      success: true,
      message: "Xóa thành công",
      data: results,
    });
  });
};

const createDriver = (req, res) => {
  const driver = req.body;
  driverService.addDriver(driver, (err, result) => {
    if (err) {
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
};

const editDriver = (req, res) => {
  const id = req.params.id;
  const driver = req.body;
  driverService.updateDriver(id, driver, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
    res.json({ message: "Cập nhật thành công" });
  });
};

module.exports = {
  getDriver,
  removeDriver,
  createDriver,
  editDriver,
};
