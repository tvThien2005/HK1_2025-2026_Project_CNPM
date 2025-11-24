// const express = require("express");
// const router = express.Router();
// const mapController = require("../controllers/mapController");

// // Route chính để test
// router.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Map API đang hoạt động!",
//     endpoints: {
//       "GET /map-data": "Lấy tất cả dữ liệu bản đồ",
//       "GET /diemdung": "Lấy danh sách điểm dừng",
//       "GET /phanbohocsinhtram": "Lấy phân bổ học sinh trạm",
//       "GET /phanbotramxe": "Lấy phân bổ trạm xe",
//       "GET /chitiettuyenduong": "Lấy chi tiết tuyến đường",
//       "GET /hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo": "Lấy học sinh theo điểm dừng",
//       "GET /chuyenxe-theo-tuyen/:maTuyenDuong": "Lấy chuyến xe theo tuyến",
//     },
//   });
// });

// // Map data routes
// router.get("/map-data", mapController.getAllMapData);
// router.get("/diemdung", mapController.getDiemDung);
// router.get("/phanbohocsinhtram", mapController.getPhanBoHocSinhTram);
// router.get("/phanbotramxe", mapController.getPhanBoTramXe);
// router.get("/chitiettuyenduong", mapController.getChiTietTuyenDuong);
// router.get("/hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo", mapController.getHocSinhTheoDiemDung);
// router.get("/chuyenxe-theo-tuyen/:maTuyenDuong", mapController.getChuyenXeTheoTuyen);

// module.exports = router;
const express = require("express");
const router = express.Router();
const mapController = require("../controllers/mapController");

// Route chính để test
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Map API đang hoạt động!",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /map-data": "Lấy tất cả dữ liệu bản đồ",
      "GET /diemdung": "Lấy danh sách điểm dừng",
      "GET /phanbohocsinhtram": "Lấy phân bổ học sinh trạm",
      "GET /phanbotramxe": "Lấy phân bổ trạm xe",
      "GET /chitiettuyenduong": "Lấy chi tiết tuyến đường",
      "GET /hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo": "Lấy học sinh theo điểm dừng",
      "GET /chuyenxe-theo-tuyen/:maTuyenDuong": "Lấy chuyến xe theo tuyến",
    },
  });
});

// Route test đơn giản
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Map API test route is working!",
    data: {
      test: "success",
      timestamp: new Date().toISOString()
    }
  });
});

// Map data routes
router.get("/map-data", mapController.getAllMapData);
router.get("/diemdung", mapController.getDiemDung);
router.get("/phanbohocsinhtram", mapController.getPhanBoHocSinhTram);
router.get("/phanbotramxe", mapController.getPhanBoTramXe);
router.get("/chitiettuyenduong", mapController.getChiTietTuyenDuong);
router.get("/hocsinh-theo-diemdung/:maDiemDung/:loaiPhanBo", mapController.getHocSinhTheoDiemDung);
router.get("/chuyenxe-theo-tuyen/:maTuyenDuong", mapController.getChuyenXeTheoTuyen);

module.exports = router;