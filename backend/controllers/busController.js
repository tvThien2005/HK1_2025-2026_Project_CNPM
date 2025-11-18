const busService = require("../services/busService");

const getBuses = (req, res) => {
  busService.getAllBuses((err, buses) => {
    if (err)
      return res.status(500).json({ success: false, error: "Lỗi server" });
    res.json({ success: true, data: buses });
  });
};

const getBusById = (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(id)) {
    return res.status(400).json({ success: false, error: "ID không hợp lệ" });
  }

  busService.getBusById(id, (err, bus) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, error: "Lỗi server khi lấy thông tin xe" });
    }
    if (!bus) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy xe" });
    }
    res.json({ success: true, data: bus });
  });
};

const createBus = (req, res) => {
  console.log("📥 Create Bus - Body:", req.body);

  const { bienSoXe, sucChua, mauXe } = req.body;

  if (!bienSoXe || !sucChua || !mauXe) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin bắt buộc (bienSoXe, sucChua, mauXe)",
    });
  }

  if (isNaN(sucChua)) {
    return res
      .status(400)
      .json({ success: false, error: "sucChua phải là số" });
  }

  const newBus = {
    bienSoXe,
    sucChua: Number(sucChua),
    mauXe,
    trangThai: "Active",
  };

  busService.addBus(newBus, (err, result) => {
    if (err) {
      console.error("🚨 Lỗi khi thêm xe:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi thêm xe",
        errorDetail: err.sqlMessage,
      });
    }
    res.json({
      success: true,
      message: "Thêm xe thành công",
      id: result.insertId,
    });
  });
};

const editBus = (req, res) => {
  const id = req.params.id;
  console.log("✏️ Edit Bus - ID:", id, "Body:", req.body);

  if (!id || isNaN(id)) {
    return res.status(400).json({ success: false, error: "ID không hợp lệ" });
  }

  const { bienSoXe, sucChua, mauXe, trangThai } = req.body;

  if (!bienSoXe || !sucChua || !mauXe) {
    return res.status(400).json({
      success: false,
      error: "Thiếu thông tin bắt buộc (bienSoXe, sucChua, mauXe)",
    });
  }

  if (isNaN(sucChua)) {
    return res
      .status(400)
      .json({ success: false, error: "sucChua phải là số" });
  }

  busService.getBusById(id, (err, currentBus) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Lỗi khi lấy thông tin xe" });
    if (!currentBus)
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy xe" });

    const updatedBus = {
      bienSoXe,
      sucChua: Number(sucChua),
      mauXe,
      trangThai: trangThai || currentBus.trangThai,
    };

    busService.updateBus(id, updatedBus, (updateErr, results) => {
      if (updateErr) {
        console.error("❌ Lỗi khi cập nhật xe:", updateErr);
        return res.status(500).json({
          success: false,
          error: "Lỗi khi cập nhật xe",
          errorDetail: updateErr.sqlMessage,
        });
      }
      res.json({
        success: true,
        message: "Cập nhật xe thành công",
        data: results,
      });
    });
  });
};

const removeBus = (req, res) => {
  const id = req.params.id;
  console.log("🗑️ Delete Bus - ID:", id);

  if (!id || isNaN(id)) {
    return res.status(400).json({ success: false, error: "ID không hợp lệ" });
  }

  busService.deleteBus(id, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xóa xe:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi khi xóa",
        errorDetail: err.sqlMessage,
      });
    }
    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy xe để xóa" });
    }
    res.json({ success: true, message: "Xóa xe thành công", data: results });
  });
};

const blockBus = (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(id))
    return res.status(400).json({ success: false, error: "ID không hợp lệ" });

  busService.blockBus(id, (err, results) => {
    if (err)
      return res.status(500).json({ success: false, error: "Lỗi khi khóa xe" });
    res.json({ success: true, message: "Xe đã bị khóa", data: results });
  });
};

const unblockBus = (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(id))
    return res.status(400).json({ success: false, error: "ID không hợp lệ" });

  busService.unblockBus(id, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Lỗi khi mở khóa xe" });
    res.json({ success: true, message: "Xe đã được mở khóa", data: results });
  });
};

module.exports = {
  getBuses,
  getBusById,
  removeBus,
  createBus,
  editBus,
  blockBus,
  unblockBus,
};
