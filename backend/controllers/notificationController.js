const notificationService = require("../services/notificationService");

const getNotificationDriver = (req, res) => {
  console.log("📢 Lấy thông báo tài xế");
  notificationService.getAllNotificationsDriver((err, notifications) => {
    if (err) {
      console.error("❌ Lỗi lấy thông báo tài xế:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server",
        errorDetail: err.sqlMessage,
      });
    }
    console.log(`✅ Trả về ${notifications.length} thông báo tài xế`);
    res.json({
      success: true,
      data: notifications,
    });
  });
};

const getNotificationParent = (req, res) => {
  console.log("📢 Lấy thông báo phụ huynh");
  notificationService.getAllNotificationsParent((err, notifications) => {
    if (err) {
      console.error("❌ Lỗi lấy thông báo phụ huynh:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server",
        errorDetail: err.sqlMessage,
      });
    }
    console.log(`✅ Trả về ${notifications.length} thông báo phụ huynh`);
    res.json({
      success: true,
      data: notifications,
    });
  });
};
const getAllParents = (req, res) => {
  console.log("📢 Lấy tất cả phụ huynh");
  notificationService.getAllParent((err, notifications) => {
    if (err) {
      console.error("❌ Lỗi lấy thông tin phụ huynh:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server",
        errorDetail: err.sqlMessage,
      });
    }
    console.log(`✅ Trả về ${notifications.length} thông tin phụ huynh`);
    res.json({
      success: true,
      data: notifications,
    });
  });
};
const getAllDrivers = (req, res) => {
  console.log("📢 Lấy tất cả Tài xế ");
  notificationService.getAllDriver((err, notifications) => {
    if (err) {
      console.error("❌ Lỗi lấy thông tin tài xế:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server",
        errorDetail: err.sqlMessage,
      });
    }
    console.log(`✅ Trả về ${notifications.length} thông tin tài xế`);
    res.json({
      success: true,
      data: notifications,
    });
  });
};

const removeNotification = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Controller - Xóa thông báo ID:", id);

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

    console.log("✅ Controller - Xóa thành công");
    res.json({
      success: true,
      message: "Xóa thông báo thành công",
      data: results,
    });
  });
};

const createNotification = (req, res) => {
  const notification = req.body;
  console.log("📝 Controller - Thêm thông báo:", notification);

  // Validate dữ liệu
  if (!notification.noiDung || !notification.maTaiKhoan) {
    return res.status(400).json({
      success: false,
      error: "Thiếu dữ liệu bắt buộc (noiDung, maTaiKhoan)",
    });
  }

  notificationService.addNotification(notification, (err, result) => {
    if (err) {
      console.error("❌ Lỗi thêm thông báo:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm thông báo",
        errorDetail: {
          code: err.code,
          sqlMessage: err.sqlMessage,
        },
      });
    }

    console.log("✅ Controller - Thêm thông báo thành công");
    res.json({
      success: true,
      message: "Thêm thông báo thành công",
      data: result,
    });
  });
};

module.exports = {
  getNotificationDriver,
  getNotificationParent,
  removeNotification,
  createNotification,
  getAllDrivers,
  getAllParents
};
