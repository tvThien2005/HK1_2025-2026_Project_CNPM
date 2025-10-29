const notificationService = require("../services/notificationService");

const getNotificationDriver = (req, res) => {
  notificationService.getAllNotificationsDriver((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};
const getNotificationParent = (req, res) => {
  notificationService.getAllNotificationsParent((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const removeNotification = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa user ID:", id);
  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  notificationService.deleteNotification(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa thông báo:", err);
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

const createNotification = (req, res) => {
  const user = req.body;
  notificationService.addNotification(user, (err, result) => {
    if (err) {
      console.error("🚨 Lỗi trong API:", err);

      // TRẢ VỀ LỖI CHI TIẾT CHO FRONTEND
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm tài khoản",
        errorDetail: {
          code: err.code,
          sqlMessage: err.sqlMessage,
          fullError: err.toString(),
        },
      });
    }
    res.json({ message: "Thêm thành công", id: result.insertId });
  });
};

module.exports = {
  getNotificationDriver,
  getNotificationParent,
  removeNotification,
  createNotification,
};
