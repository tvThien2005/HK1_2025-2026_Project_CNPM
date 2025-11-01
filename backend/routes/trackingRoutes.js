const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

// Route chính để test
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tracking API đang hoạt động!",
    endpoints: {
      "GET /bus-data": "Lấy tất cả dữ liệu bus",
      "GET /hocsinh": "Lấy danh sách học sinh",
      "GET /diachi": "Lấy danh sách địa chỉ",
      "GET /vitrithuc": "Lấy vị trí thực",
      "GET /taixe": "Lấy danh sách tài xế",
      "GET /xebuyt": "Lấy danh sách xe bus",
      "GET /chuyenxe": "Lấy danh sách chuyến xe",
      "GET /lichtrinh": "Lấy lịch trình",
      "GET /tuyenduong": "Lấy tuyến đường",
      "GET /phanbohocsinh": "Lấy phân bố học sinh",
      "POST /update-position": "Cập nhật vị trí xe",
      "GET /current-positions": "Lấy vị trí hiện tại",
    },
  });
});

// Routes cho theo dõi vị trí xe
router.get("/bus-data", trackingController.getAllBusData);
router.get("/hocsinh", trackingController.getHocSinh);
router.get("/diachi", trackingController.getDiaChi);
router.get("/vitrithuc", trackingController.getViTriThuc);
router.get("/taixe", trackingController.getTaiXe);
router.get("/xebuyt", trackingController.getXeBuyt);
router.get("/chuyenxe", trackingController.getChuyenXe);
router.get("/lichtrinh", trackingController.getLichTrinh);
router.get("/tuyenduong", trackingController.getTuyenDuong);
router.get("/phanbohocsinh", trackingController.getPhanBoHocSinh);

// Route cập nhật vị trí xe real-time
router.post("/update-position", trackingController.updateBusPosition);
router.get("/current-positions", trackingController.getCurrentPositions);

module.exports = router;
