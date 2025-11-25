const scheduledService = require("../services/scheduledService");

const getScheduled = (req, res) => {
  scheduledService.getAllScheduled((err, buses) => {
    if (err)
      return res.status(500).json({ success: false, error: "Lỗi server" });
    res.json({ success: true, data: buses });
  });
};

const createScheduled = (req, res) => {
  console.log("📥 Create Schedule - Body:", req.body);
  console.log("📥 Raw data received:", {
    ngay: req.body.ngay,
    thoiGianDi: req.body.thoiGianDi,
    thoiGianDen: req.body.thoiGianDen,
  });
  const scheduled = req.body;
  scheduledService.addScheduled(scheduled, (err, result) => {
    if (err) {
      console.error("🚨 Lỗi khi thêm lịch trình:", err);
      return res.status(500).json({
        success: false,
        error: "Lỗi server khi thêm lịch trình",
        errorDetail: err.sqlMessage,
      });
    }
    res.json({
      success: true,
      message: "Thêm lịch trình thành công",
      id: result.insertId,
    });
  });
};

const editScheduled = (req, res) => {
  const id = req.params.id;
  const scheduled = req.body;
  scheduledService.updateScheduled(id, scheduled, (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi cập nhật" });
    res.json({ message: "Cập nhật thành công" });
  });
};

module.exports = {
  getScheduled,
  createScheduled,
  editScheduled,
};
