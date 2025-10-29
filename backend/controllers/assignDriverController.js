const assignDriver = require("../services/assignDriverService");

const getAssign = (req, res) => {
  assignDriver.getAllAssignDrivers((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};
const getBus = (req, res) => {
  assignDriver.getAllBuses((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const getDriver = (req, res) => {
  assignDriver.getAllDrivers((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const getSchedule = (req, res) => {
  assignDriver.getAllSchedules((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const getRoute = (req, res) => {
  assignDriver.getAllRoutes((err, users) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });
    // console.log("📦 Dữ liệu trả về:", users);
    res.json(users);
  });
};

const removeAssign = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Backend - Xóa phân công ID:", id);

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "ID không hợp lệ",
    });
  }

  assignDriver.deleteAssignDriver(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa phân công:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa",
        errorDetail: err.sqlMessage,
      });
    }

    // Kiểm tra có xóa được bản ghi nào không
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy phân công để xóa",
      });
    }

    console.log("✅ Xóa thành công, affected rows:", results.affectedRows);
    res.json({
      success: true,
      message: "Xóa thành công",
      data: results,
    });
  });
};

const createAssign = (req, res) => {
  const user = req.body;
  assignDriver.addAssignDriver(user, (err, result) => {
    if (err) {
      console.error("🚨 Lỗi trong API:", err);

      // TRẢ VỀ LỖI CHI TIẾT CHO FRONTEND
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm phân công",
        errorDetail: {
          code: err.code,
          sqlMessage: err.sqlMessage,
          fullError: err.toString(),
        },
      });
    }
    res.json({ message: "Thêm thành công", id: result.insertId });
  });
};

const editAssign = (req, res) => {
  const id = req.params.id;
  const user = req.body;
  assignDriver.updateAssignDriver(id, user, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
    res.json({ message: "Cập nhật thành công" });
  });
};

module.exports = {
  getAssign,
  getBus,
  getDriver,
  getSchedule,
  getRoute,
  removeAssign,
  createAssign,
  editAssign,
};
