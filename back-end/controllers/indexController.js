// const indexService = require("../services/indexService");

// // Đăng nhập
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const result = await indexService.login(username, password);
//     res.json({ success: true, data: result });
//   } catch (error) {
//     console.error("❌ Lỗi login:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy thông tin tài khoản
// exports.getAccountInfo = async (req, res) => {
//   try {
//     const { maTaiKhoan } = req.params;
//     const accountInfo = await indexService.getAccountInfo(maTaiKhoan);
//     res.json({ success: true, data: accountInfo });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách học sinh
// exports.getHocSinh = async (req, res) => {
//   try {
//     const hocSinh = await indexService.getHocSinh();
//     res.json({ success: true, data: hocSinh });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách xe buýt
// exports.getXeBuyt = async (req, res) => {
//   try {
//     const xeBuyt = await indexService.getXeBuyt();
//     res.json({ success: true, data: xeBuyt });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách tuyến đường
// exports.getTuyenDuong = async (req, res) => {
//   try {
//     const tuyenDuong = await indexService.getTuyenDuong();
//     res.json({ success: true, data: tuyenDuong });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách lịch trình
// exports.getLichTrinh = async (req, res) => {
//   try {
//     const lichTrinh = await indexService.getLichTrinh();
//     res.json({ success: true, data: lichTrinh });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách chuyến xe
// exports.getChuyenXe = async (req, res) => {
//   try {
//     const { status } = req.query;
//     const chuyenXe = await indexService.getChuyenXe(status);
//     res.json({ success: true, data: chuyenXe });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy thông tin chuyến xe theo ID
// exports.getChuyenXeById = async (req, res) => {
//   try {
//     const { maChuyenXe } = req.params;
//     const chuyenXe = await indexService.getChuyenXeById(maChuyenXe);
//     res.json({ success: true, data: chuyenXe });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Cập nhật trạng thái chuyến xe
// exports.updateChuyenXeStatus = async (req, res) => {
//   try {
//     const { maChuyenXe } = req.params;
//     const { trangThai } = req.body;
//     const result = await indexService.updateChuyenXeStatus(maChuyenXe, trangThai);
//     res.json({ success: true, data: result });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách tài xế
// exports.getTaiXe = async (req, res) => {
//   try {
//     const taiXe = await indexService.getTaiXe();
//     res.json({ success: true, data: taiXe });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách phụ huynh
// exports.getPhuHuynh = async (req, res) => {
//   try {
//     const phuHuynh = await indexService.getPhuHuynh();
//     res.json({ success: true, data: phuHuynh });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy vị trí chuyến xe
// exports.getViTriChuyenXe = async (req, res) => {
//   try {
//     const viTriChuyenXe = await indexService.getViTriChuyenXe();
//     res.json({ success: true, data: viTriChuyenXe });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy thông báo
// exports.getThongBao = async (req, res) => {
//   try {
//     const { maTaiKhoan } = req.params;
//     const thongBao = await indexService.getThongBao(maTaiKhoan);
//     res.json({ success: true, data: thongBao });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy cảnh báo
// exports.getCanhBao = async (req, res) => {
//   try {
//     const canhBao = await indexService.getCanhBao();
//     res.json({ success: true, data: canhBao });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy học sinh của phụ huynh
// exports.getParentStudents = async (req, res) => {
//   try {
//     const { maTaiKhoan } = req.params;
//     const students = await indexService.getParentStudents(maTaiKhoan);
//     res.json({ success: true, data: students });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy phân bổ học sinh trạm
// exports.getPhanBoHocSinhTram = async (req, res) => {
//   try {
//     const { maChuyenXe, maHocSinh } = req.query;
    
//     if (maChuyenXe) {
//       const allocations = await indexService.getPhanBoHocSinhTramByChuyenXe(maChuyenXe);
//       res.json({ success: true, data: allocations });
//     } else {
//       res.status(400).json({ success: false, error: "Thiếu tham số maChuyenXe" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy tất cả chuyến xe với chi tiết
// exports.getAllTripsWithDetails = async (req, res) => {
//   try {
//     const trips = await indexService.getAllTripsWithDetails();
//     res.json({ success: true, data: trips });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
const indexService = require("../services/indexService");

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🔐 Login attempt for user:", username);
    
    const result = await indexService.login(username, password);
    
    res.json({ 
      success: true, 
      data: result,
      message: "Đăng nhập thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi login:", error.message);
    res.status(401).json({ 
      success: false, 
      error: error.message,
      message: "Đăng nhập thất bại"
    });
  }
};

// Lấy thông tin tài khoản
exports.getAccountInfo = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    console.log("🔍 Getting account info for:", maTaiKhoan);
    
    const accountInfo = await indexService.getAccountInfo(maTaiKhoan);
    
    res.json({ 
      success: true, 
      data: accountInfo,
      message: "Lấy thông tin tài khoản thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi getAccountInfo:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy thông tin tài khoản"
    });
  }
};

// Lấy danh sách học sinh
exports.getHocSinh = async (req, res) => {
  try {
    console.log("🎓 Getting student data...");
    
    const hocSinh = await indexService.getHocSinh();
    
    res.json({ 
      success: true, 
      data: hocSinh,
      message: "Lấy danh sách học sinh thành công",
      count: Array.isArray(hocSinh) ? hocSinh.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getHocSinh:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách học sinh"
    });
  }
};

// Lấy danh sách xe buýt
exports.getXeBuyt = async (req, res) => {
  try {
    console.log("🚌 Getting bus data...");
    
    const xeBuyt = await indexService.getXeBuyt();
    
    res.json({ 
      success: true, 
      data: xeBuyt,
      message: "Lấy danh sách xe buýt thành công",
      count: Array.isArray(xeBuyt) ? xeBuyt.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getXeBuyt:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách xe buýt"
    });
  }
};

// Lấy danh sách tuyến đường
exports.getTuyenDuong = async (req, res) => {
  try {
    console.log("🛣️ Getting route data...");
    
    const tuyenDuong = await indexService.getTuyenDuong();
    
    res.json({ 
      success: true, 
      data: tuyenDuong,
      message: "Lấy danh sách tuyến đường thành công",
      count: Array.isArray(tuyenDuong) ? tuyenDuong.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getTuyenDuong:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách tuyến đường"
    });
  }
};

// Lấy danh sách lịch trình
exports.getLichTrinh = async (req, res) => {
  try {
    console.log("📅 Getting schedule data...");
    
    const lichTrinh = await indexService.getLichTrinh();
    
    res.json({ 
      success: true, 
      data: lichTrinh,
      message: "Lấy danh sách lịch trình thành công",
      count: Array.isArray(lichTrinh) ? lichTrinh.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getLichTrinh:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách lịch trình"
    });
  }
};

// Lấy danh sách chuyến xe
exports.getChuyenXe = async (req, res) => {
  try {
    const { status } = req.query;
    console.log("🚗 Getting trip data, status:", status || "all");
    
    const chuyenXe = await indexService.getChuyenXe(status);
    
    res.json({ 
      success: true, 
      data: chuyenXe,
      message: "Lấy danh sách chuyến xe thành công",
      count: Array.isArray(chuyenXe) ? chuyenXe.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getChuyenXe:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách chuyến xe"
    });
  }
};

// Lấy thông tin chuyến xe theo ID
exports.getChuyenXeById = async (req, res) => {
  try {
    const { maChuyenXe } = req.params;
    console.log("🔍 Getting trip details for:", maChuyenXe);
    
    const chuyenXe = await indexService.getChuyenXeById(maChuyenXe);
    
    if (!chuyenXe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chuyến xe"
      });
    }
    
    res.json({ 
      success: true, 
      data: chuyenXe,
      message: "Lấy thông tin chuyến xe thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi getChuyenXeById:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy thông tin chuyến xe"
    });
  }
};

// Cập nhật trạng thái chuyến xe
exports.updateChuyenXeStatus = async (req, res) => {
  try {
    const { maChuyenXe } = req.params;
    const { trangThai } = req.body;
    
    console.log("🔄 Updating trip status:", maChuyenXe, "->", trangThai);
    
    const result = await indexService.updateChuyenXeStatus(maChuyenXe, trangThai);
    
    res.json({ 
      success: true, 
      data: result,
      message: "Cập nhật trạng thái chuyến xe thành công"
    });
  } catch (error) {
    console.error("❌ Lỗi updateChuyenXeStatus:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể cập nhật trạng thái chuyến xe"
    });
  }
};

// Lấy danh sách tài xế
exports.getTaiXe = async (req, res) => {
  try {
    console.log("👨‍✈️ Getting driver data...");
    
    const taiXe = await indexService.getTaiXe();
    
    res.json({ 
      success: true, 
      data: taiXe,
      message: "Lấy danh sách tài xế thành công",
      count: Array.isArray(taiXe) ? taiXe.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getTaiXe:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách tài xế"
    });
  }
};

// Lấy danh sách phụ huynh
exports.getPhuHuynh = async (req, res) => {
  try {
    console.log("👨‍👩‍👧‍👦 Getting parent data...");
    
    const phuHuynh = await indexService.getPhuHuynh();
    
    res.json({ 
      success: true, 
      data: phuHuynh,
      message: "Lấy danh sách phụ huynh thành công",
      count: Array.isArray(phuHuynh) ? phuHuynh.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getPhuHuynh:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách phụ huynh"
    });
  }
};

// Lấy học sinh của phụ huynh
exports.getParentStudents = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    console.log("🔍 Getting students for parent:", maTaiKhoan);
    
    const students = await indexService.getParentStudents(maTaiKhoan);
    
    res.json({ 
      success: true, 
      data: students,
      message: `Lấy danh sách học sinh cho phụ huynh ${maTaiKhoan} thành công`,
      count: Array.isArray(students) ? students.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getParentStudents:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy học sinh của phụ huynh"
    });
  }
};

// Lấy vị trí chuyến xe
exports.getViTriChuyenXe = async (req, res) => {
  try {
    console.log("📍 Getting trip locations...");
    
    const viTriChuyenXe = await indexService.getViTriChuyenXe();
    
    res.json({ 
      success: true, 
      data: viTriChuyenXe,
      message: "Lấy vị trí chuyến xe thành công",
      count: Array.isArray(viTriChuyenXe) ? viTriChuyenXe.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getViTriChuyenXe:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy vị trí chuyến xe"
    });
  }
};

// Lấy thông báo
exports.getThongBao = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    console.log("📢 Getting notifications for:", maTaiKhoan);
    
    const thongBao = await indexService.getThongBao(maTaiKhoan);
    
    res.json({ 
      success: true, 
      data: thongBao,
      message: "Lấy thông báo thành công",
      count: Array.isArray(thongBao) ? thongBao.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getThongBao:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy thông báo"
    });
  }
};

// Lấy cảnh báo
exports.getCanhBao = async (req, res) => {
  try {
    console.log("⚠️ Getting warnings...");
    
    const canhBao = await indexService.getCanhBao();
    
    res.json({ 
      success: true, 
      data: canhBao,
      message: "Lấy cảnh báo thành công",
      count: Array.isArray(canhBao) ? canhBao.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getCanhBao:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy cảnh báo"
    });
  }
};

// Lấy phân bổ học sinh trạm
exports.getPhanBoHocSinhTram = async (req, res) => {
  try {
    const { maChuyenXe, maHocSinh } = req.query;
    console.log("🎯 Getting student allocations:", { maChuyenXe, maHocSinh });
    
    if (maChuyenXe) {
      const allocations = await indexService.getPhanBoHocSinhTramByChuyenXe(maChuyenXe);
      res.json({ 
        success: true, 
        data: allocations,
        message: "Lấy phân bổ học sinh trạm thành công",
        count: Array.isArray(allocations) ? allocations.length : 0
      });
    } else if (maHocSinh) {
      const allocations = await indexService.getStudentAllocations(maHocSinh);
      res.json({ 
        success: true, 
        data: allocations,
        message: "Lấy phân bổ học sinh thành công",
        count: Array.isArray(allocations) ? allocations.length : 0
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: "Thiếu tham số maChuyenXe hoặc maHocSinh" 
      });
    }
  } catch (error) {
    console.error("❌ Lỗi getPhanBoHocSinhTram:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy phân bổ học sinh trạm"
    });
  }
};

// Lấy tất cả chuyến xe với chi tiết
exports.getAllTripsWithDetails = async (req, res) => {
  try {
    console.log("🚗 Getting all trips with details...");
    
    const trips = await indexService.getAllTripsWithDetails();
    
    res.json({ 
      success: true, 
      data: trips,
      message: "Lấy danh sách chuyến xe thành công",
      count: Array.isArray(trips) ? trips.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getAllTripsWithDetails:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách chuyến xe"
    });
  }
};