const express = require("express");
const router = express.Router();
const infoController = require("../controllers/infoController");

// Route chính để test
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Info API đang hoạt động!",
    endpoints: {
      "GET /phuhuynh/:maTaiKhoan/hocsinh": "Lấy học sinh của phụ huynh",
      "GET /infoAccount/:maTaiKhoan": "Lấy thông tin tài khoản phụ huynh",
      "PUT /infoAccount/:maTaiKhoan": "Cập nhật thông tin tài khoản",
      "GET /lichsu/:maTaiKhoan": "Lấy lịch sử đi học",
      "POST /notifications/pickup": "Tạo thông báo đón học sinh",
    },
  });
});

// Parent info routes
router.get("/phuhuynh/:maTaiKhoan/hocsinh", infoController.getParentStudents);
router.get("/infoAccount/:maTaiKhoan", infoController.getParentInfo);
router.put("/infoAccount/:maTaiKhoan", infoController.updateParentInfo);
router.get("/lichsu/:maTaiKhoan", infoController.getStudyHistory);

// Notification routes
router.post("/notifications/pickup", infoController.createPickupNotification);

module.exports = router;