// const mapService = require("../services/mapService");

// // Lấy tất cả dữ liệu cho bản đồ
// exports.getAllMapData = async (req, res) => {
//   try {
//     const data = await mapService.getAllMapData();
//     res.json({ success: true, data });
//   } catch (error) {
//     console.error("❌ Lỗi getAllMapData:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy danh sách điểm dừng
// exports.getDiemDung = async (req, res) => {
//   try {
//     const diemDung = await mapService.getDiemDung();
//     res.json({ success: true, data: diemDung });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy phân bổ học sinh trạm
// exports.getPhanBoHocSinhTram = async (req, res) => {
//   try {
//     const { maHocSinh, maDiemDung, maChuyenXe } = req.query;
//     const phanBo = await mapService.getPhanBoHocSinhTram(maHocSinh, maDiemDung, maChuyenXe);
//     res.json({ success: true, data: phanBo });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy phân bổ trạm xe
// exports.getPhanBoTramXe = async (req, res) => {
//   try {
//     const { maDiemDung, maChuyenXe } = req.query;
//     const phanBo = await mapService.getPhanBoTramXe(maDiemDung, maChuyenXe);
//     res.json({ success: true, data: phanBo });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy chi tiết tuyến đường
// exports.getChiTietTuyenDuong = async (req, res) => {
//   try {
//     const { maTuyenDuong } = req.query;
//     const chiTiet = await mapService.getChiTietTuyenDuong(maTuyenDuong);
//     res.json({ success: true, data: chiTiet });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy học sinh theo điểm dừng
// exports.getHocSinhTheoDiemDung = async (req, res) => {
//   try {
//     const { maDiemDung, loaiPhanBo } = req.params;
//     const hocSinh = await mapService.getHocSinhTheoDiemDung(maDiemDung, loaiPhanBo);
//     res.json({ success: true, data: hocSinh });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Lấy chuyến xe theo tuyến
// exports.getChuyenXeTheoTuyen = async (req, res) => {
//   try {
//     const { maTuyenDuong } = req.params;
//     const chuyenXe = await mapService.getChuyenXeTheoTuyen(maTuyenDuong);
//     res.json({ success: true, data: chuyenXe });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
const mapService = require("../services/mapService");

// Lấy tất cả dữ liệu cho bản đồ
exports.getAllMapData = async (req, res) => {
  try {
    console.log("🗺️ Requesting all map data...");
    
    const data = await mapService.getAllMapData();
    
    res.json({ 
      success: true, 
      data,
      message: "Lấy dữ liệu bản đồ thành công",
      counts: {
        diemdung: Array.isArray(data.diemdung) ? data.diemdung.length : 0,
        phanbohocsinhtram: Array.isArray(data.phanbohocsinhtram) ? data.phanbohocsinhtram.length : 0,
        phanbotramxe: Array.isArray(data.phanbotramxe) ? data.phanbotramxe.length : 0,
        chitiettuyenduong: Array.isArray(data.chitiettuyenduong) ? data.chitiettuyenduong.length : 0
      }
    });
  } catch (error) {
    console.error("❌ Lỗi getAllMapData:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy dữ liệu bản đồ"
    });
  }
};

// Lấy danh sách điểm dừng
exports.getDiemDung = async (req, res) => {
  try {
    console.log("📍 Requesting bus stops...");
    
    const diemDung = await mapService.getDiemDung();
    
    res.json({ 
      success: true, 
      data: diemDung,
      message: "Lấy danh sách điểm dừng thành công",
      count: Array.isArray(diemDung) ? diemDung.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getDiemDung:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy danh sách điểm dừng"
    });
  }
};

// Lấy phân bổ học sinh trạm
exports.getPhanBoHocSinhTram = async (req, res) => {
  try {
    const { maHocSinh, maDiemDung, maChuyenXe } = req.query;
    console.log("🎯 Requesting student-stop allocations...", { maHocSinh, maDiemDung, maChuyenXe });
    
    const phanBo = await mapService.getPhanBoHocSinhTram(maHocSinh, maDiemDung, maChuyenXe);
    
    res.json({ 
      success: true, 
      data: phanBo,
      message: "Lấy phân bổ học sinh trạm thành công",
      count: Array.isArray(phanBo) ? phanBo.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getPhanBoHocSinhTram:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy phân bổ học sinh trạm"
    });
  }
};

// Lấy phân bổ trạm xe
exports.getPhanBoTramXe = async (req, res) => {
  try {
    const { maDiemDung, maChuyenXe } = req.query;
    console.log("🚏 Requesting stop-bus allocations...", { maDiemDung, maChuyenXe });
    
    const phanBo = await mapService.getPhanBoTramXe(maDiemDung, maChuyenXe);
    
    res.json({ 
      success: true, 
      data: phanBo,
      message: "Lấy phân bổ trạm xe thành công",
      count: Array.isArray(phanBo) ? phanBo.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getPhanBoTramXe:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy phân bổ trạm xe"
    });
  }
};

// Lấy chi tiết tuyến đường
exports.getChiTietTuyenDuong = async (req, res) => {
  try {
    const { maTuyenDuong } = req.query;
    console.log("🛣️ Requesting route details...", { maTuyenDuong });
    
    const chiTiet = await mapService.getChiTietTuyenDuong(maTuyenDuong);
    
    res.json({ 
      success: true, 
      data: chiTiet,
      message: "Lấy chi tiết tuyến đường thành công",
      count: Array.isArray(chiTiet) ? chiTiet.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getChiTietTuyenDuong:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy chi tiết tuyến đường"
    });
  }
};

// Lấy học sinh theo điểm dừng
exports.getHocSinhTheoDiemDung = async (req, res) => {
  try {
    const { maDiemDung, loaiPhanBo } = req.params;
    console.log("🎓 Requesting students by stop...", { maDiemDung, loaiPhanBo });
    
    const hocSinh = await mapService.getHocSinhTheoDiemDung(maDiemDung, loaiPhanBo);
    
    res.json({ 
      success: true, 
      data: hocSinh,
      message: `Lấy học sinh theo điểm dừng ${maDiemDung} thành công`,
      count: Array.isArray(hocSinh) ? hocSinh.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getHocSinhTheoDiemDung:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy học sinh theo điểm dừng"
    });
  }
};

// Lấy chuyến xe theo tuyến
exports.getChuyenXeTheoTuyen = async (req, res) => {
  try {
    const { maTuyenDuong } = req.params;
    console.log("🚗 Requesting trips by route...", { maTuyenDuong });
    
    const chuyenXe = await mapService.getChuyenXeTheoTuyen(maTuyenDuong);
    
    res.json({ 
      success: true, 
      data: chuyenXe,
      message: `Lấy chuyến xe theo tuyến ${maTuyenDuong} thành công`,
      count: Array.isArray(chuyenXe) ? chuyenXe.length : 0
    });
  } catch (error) {
    console.error("❌ Lỗi getChuyenXeTheoTuyen:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Không thể lấy chuyến xe theo tuyến"
    });
  }
};