// const express = require("express");
// const router = express.Router();
// const indexController = require("../controllers/indexController");

// // Route chính để test
// router.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Index API đang hoạt động!",
//     endpoints: {
//       "POST /login": "Đăng nhập",
//       "GET /taikhoan/:maTaiKhoan": "Lấy thông tin tài khoản",
//       "GET /hocsinh": "Lấy danh sách học sinh",
//       "GET /xebuyt": "Lấy danh sách xe buýt",
//       "GET /tuyenduong": "Lấy danh sách tuyến đường",
//       "GET /lichtrinh": "Lấy danh sách lịch trình",
//       "GET /chuyenxe": "Lấy danh sách chuyến xe",
//       "GET /chuyenxe/:maChuyenXe": "Lấy thông tin chuyến xe theo ID",
//       "PUT /chuyenxe/:maChuyenXe/status": "Cập nhật trạng thái chuyến xe",
//       "GET /taixe": "Lấy danh sách tài xế",
//       "GET /phuhuynh": "Lấy danh sách phụ huynh",
//       "GET /phuhuynh/:maTaiKhoan/hocsinh": "Lấy học sinh của phụ huynh", // THÊM DÒNG NÀY
//       "GET /vitrichuyenxe": "Lấy vị trí chuyến xe",
//       "GET /thongbao/:maTaiKhoan": "Lấy thông báo",
//       "GET /canhbao": "Lấy cảnh báo",
//     },
//   });
// });

// // Authentication routes
// router.post("/login", indexController.login);

// // Account routes
// router.get("/taikhoan/:maTaiKhoan", indexController.getAccountInfo);

// // Data routes
// router.get("/hocsinh", indexController.getHocSinh);
// router.get("/xebuyt", indexController.getXeBuyt);
// router.get("/tuyenduong", indexController.getTuyenDuong);
// router.get("/lichtrinh", indexController.getLichTrinh);
// router.get("/chuyenxe", indexController.getChuyenXe);
// router.get("/chuyenxe/:maChuyenXe", indexController.getChuyenXeById);
// router.put("/chuyenxe/:maChuyenXe/status", indexController.updateChuyenXeStatus);
// router.get("/taixe", indexController.getTaiXe);
// router.get("/phuhuynh", indexController.getPhuHuynh);
// router.get("/phuhuynh/:maTaiKhoan/hocsinh", indexController.getParentStudents); 
// router.get("/vitrichuyenxe", indexController.getViTriChuyenXe);

// // Notification routes
// router.get("/thongbao/:maTaiKhoan", indexController.getThongBao);
// router.get("/canhbao", indexController.getCanhBao);

// // Thêm các routes mới
// router.get("/phanbohocsinhtram", indexController.getPhanBoHocSinhTram);
// router.get("/chuyenxe-all", indexController.getAllTripsWithDetails);

// module.exports = router;
// routes/indexRoutes.js
const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

// Route chính để test
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Index API đang hoạt động!",
    endpoints: {
      "POST /login": "Đăng nhập",
      "GET /taikhoan/:maTaiKhoan": "Lấy thông tin tài khoản",
      "GET /hocsinh": "Lấy danh sách học sinh",
      "GET /xebuyt": "Lấy danh sách xe buýt",
      "GET /tuyenduong": "Lấy danh sách tuyến đường",
      "GET /lichtrinh": "Lấy danh sách lịch trình",
      "GET /chuyenxe": "Lấy danh sách chuyến xe",
      "GET /chuyenxe/:maChuyenXe": "Lấy thông tin chuyến xe theo ID",
      "PUT /chuyenxe/:maChuyenXe/status": "Cập nhật trạng thái chuyến xe",
      "GET /taixe": "Lấy danh sách tài xế",
      "GET /phuhuynh": "Lấy danh sách phụ huynh",
      "GET /phuhuynh/:maTaiKhoan/hocsinh": "Lấy học sinh của phụ huynh",
      "GET /vitrichuyenxe": "Lấy vị trí chuyến xe",
      "GET /thongbao/:maTaiKhoan": "Lấy thông báo",
      "GET /canhbao": "Lấy cảnh báo",
      "GET /phanbohocsinhtram": "Lấy phân bổ học sinh trạm",
      "GET /chuyenxe-all": "Lấy tất cả chuyến xe với chi tiết"
    },
  });
});

// Route test đơn giản
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "API test route is working!",
    data: {
      test: "success",
      timestamp: new Date().toISOString()
    }
  });
});

// Route test database
router.get("/test-db", async (req, res) => {
  try {
    const db = require("../config/db");
    db.query("SELECT 1 as test", (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }
      res.json({
        success: true,
        message: "Database is working!",
        data: results
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Authentication routes
router.post("/login", indexController.login);

// Account routes
router.get("/taikhoan/:maTaiKhoan", indexController.getAccountInfo);

// Data routes
router.get("/hocsinh", indexController.getHocSinh);
router.get("/xebuyt", indexController.getXeBuyt);
router.get("/tuyenduong", indexController.getTuyenDuong);
router.get("/lichtrinh", indexController.getLichTrinh);
router.get("/chuyenxe", indexController.getChuyenXe);
router.get("/chuyenxe/:maChuyenXe", indexController.getChuyenXeById);
router.put("/chuyenxe/:maChuyenXe/status", indexController.updateChuyenXeStatus);
router.get("/taixe", indexController.getTaiXe);
router.get("/phuhuynh", indexController.getPhuHuynh);
router.get("/phuhuynh/:maTaiKhoan/hocsinh", indexController.getParentStudents);
router.get("/vitrichuyenxe", indexController.getViTriChuyenXe);

// Notification routes
router.get("/thongbao/:maTaiKhoan", indexController.getThongBao);
router.get("/canhbao", indexController.getCanhBao);

// Allocation routes
router.get("/phanbohocsinhtram", indexController.getPhanBoHocSinhTram);

// Trip routes
router.get("/chuyenxe-all", indexController.getAllTripsWithDetails);

module.exports = router;