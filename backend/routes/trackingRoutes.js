const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/trackingController");

// ==================== ROUTES CŨ - GIỮ NGUYÊN ====================

// Route chính lấy tất cả dữ liệu
router.get("/bus-data", trackingController.getAllBusData);

// Routes lấy dữ liệu từng bảng
router.get("/hocsinh", trackingController.getHocSinh);
router.get("/diachi", trackingController.getDiaChi);
router.get("/vitrithuc", trackingController.getViTriThuc);
router.get("/taixe", trackingController.getTaiXe);
router.get("/xebuyt", trackingController.getXeBuyt);
router.get("/chuyenxe", trackingController.getChuyenXe);
router.get("/lichtrinh", trackingController.getLichTrinh);
router.get("/tuyenduong", trackingController.getTuyenDuong);
router.get("/phanbohocsinh", trackingController.getPhanBoHocSinh);

// Routes cập nhật vị trí
router.post("/update-position", trackingController.updateBusPosition);
router.get("/current-positions", trackingController.getCurrentPositions);

// ==================== ✅ ROUTES MỚI - THÊM VÀO ====================

// ✅ Route chính với trạm (MỚI)
router.get(
  "/bus-data-with-stations",
  trackingController.getAllBusDataWithStations
);

// ✅ Routes riêng lẻ cho trạm
router.get("/diemdung", trackingController.getDiemDung);
router.get("/phanbohocsinhtram", trackingController.getPhanBoHocSinhTram);
router.get("/phanbotramxe", trackingController.getPhanBoTramXe);

module.exports = router;
