const infoService = require("../services/infoService");

// Lấy học sinh của phụ huynh
exports.getParentStudents = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const hocSinh = await infoService.getParentStudents(maTaiKhoan);
    res.json({ success: true, data: hocSinh });
  } catch (error) {
    console.error("❌ Lỗi getParentStudents:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy thông tin tài khoản phụ huynh
exports.getParentInfo = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const accountInfo = await infoService.getParentInfo(maTaiKhoan);
    res.json({ success: true, data: accountInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật thông tin tài khoản phụ huynh
exports.updateParentInfo = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const { fullName, phone, dob, tenDangNhap, password } = req.body;
    const result = await infoService.updateParentInfo(
      maTaiKhoan,
      fullName,
      phone,
      dob,
      tenDangNhap,
      password
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy lịch sử đi học
exports.getStudyHistory = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const lichSu = await infoService.getStudyHistory(maTaiKhoan);
    res.json({ success: true, data: lichSu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tạo thông báo đón học sinh
exports.createPickupNotification = async (req, res) => {
  try {
    const { maHocSinh, maChuyenXe, tenHocSinh, tenTaiXe, bienSoXe } = req.body;
    const result = await infoService.createPickupNotification(
      maHocSinh,
      maChuyenXe,
      tenHocSinh,
      tenTaiXe,
      bienSoXe
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};