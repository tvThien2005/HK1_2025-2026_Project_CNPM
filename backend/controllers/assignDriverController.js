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
  const assign = req.body;

  assignDriver.addAssignDriver(assign, (err, result) => {
    if (err) {
      console.error("Lỗi server:", err);
      return res.status(200).json({
        success: false,
        message: "Lỗi server khi thêm phân công",
      });
    }

    // Nếu bị trùng
    if (result.conflict) {
      return res.status(200).json({
        success: false,
        message: result.message,
      });
    }

    // Thành công
    res.status(200).json({
      success: true,
      message: "Thêm phân công thành công",
      id: result.results.insertId,
    });
  });
};

const editAssign = (req, res) => {
  const id = req.params.id;
  const assign = req.body;
  assignDriver.updateAssignDriver(id, assign, (err, results) => {
    if (err) {
      if (err.code === "CANNOT_DECREASE_STATUS") {
        return res.status(409).json({ success: false, message: err.message });
      }
      if (err.code === "INVALID_STATUS") {
        return res.status(400).json({ success: false, message: err.message });
      }
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật",
        errorDetail: err.message,
      });
    }
    res.json({ message: "Cập nhật thành công", data: results });
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
