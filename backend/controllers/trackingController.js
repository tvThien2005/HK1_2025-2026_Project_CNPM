const trackingService = require("../services/trackingService");

// Lấy tất cả dữ liệu cho bản đồ
exports.getAllBusData = async (req, res) => {
  try {
    const data = await trackingService.getAllBusData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Lỗi getAllBusData:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Các API riêng lẻ
exports.getHocSinh = async (req, res) => {
  try {
    const hocSinh = await trackingService.getHocSinh();
    res.json({ success: true, data: hocSinh });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDiaChi = async (req, res) => {
  try {
    const diaChi = await trackingService.getDiaChi();
    res.json({ success: true, data: diaChi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getViTriThuc = async (req, res) => {
  try {
    const viTriThuc = await trackingService.getViTriThuc();
    res.json({ success: true, data: viTriThuc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTaiXe = async (req, res) => {
  try {
    const taiXe = await trackingService.getTaiXe();
    res.json({ success: true, data: taiXe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getXeBuyt = async (req, res) => {
  try {
    const xeBuyt = await trackingService.getXeBuyt();
    res.json({ success: true, data: xeBuyt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChuyenXe = async (req, res) => {
  try {
    const chuyenXe = await trackingService.getChuyenXe();
    res.json({ success: true, data: chuyenXe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLichTrinh = async (req, res) => {
  try {
    const lichTrinh = await trackingService.getLichTrinh();
    res.json({ success: true, data: lichTrinh });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTuyenDuong = async (req, res) => {
  try {
    const tuyenDuong = await trackingService.getTuyenDuong();
    res.json({ success: true, data: tuyenDuong });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPhanBoHocSinh = async (req, res) => {
  try {
    const phanBoHocSinh = await trackingService.getPhanBoHocSinh();
    res.json({ success: true, data: phanBoHocSinh });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật vị trí xe real-time
exports.updateBusPosition = async (req, res) => {
  try {
    const { busId, lat, lng, speed } = req.body;
    const result = await trackingService.updateBusPosition(
      busId,
      lat,
      lng,
      speed
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy vị trí hiện tại của tất cả xe
exports.getCurrentPositions = async (req, res) => {
  try {
    const positions = await trackingService.getCurrentPositions();
    res.json({ success: true, data: positions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
