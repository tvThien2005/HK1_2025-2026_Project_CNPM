const routeService = require("../services/routeService");

// Lấy tất cả tuyến đường
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await routeService.getAllRoutes();
    res.json({ success: true, data: routes });
  } catch (error) {
    console.error("❌ Lỗi getAllRoutes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy chi tiết tuyến đường theo ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    if (!route) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy tuyến đường" });
    }
    res.json({ success: true, data: route });
  } catch (error) {
    console.error("❌ Lỗi getRouteById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Lấy danh sách trạm của tuyến đường
exports.getRouteStations = async (req, res) => {
  try {
    const stations = await routeService.getRouteStations(req.params.id);
    res.json({ success: true, data: stations });
  } catch (error) {
    console.error("❌ Lỗi getRouteStations:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tạo tuyến đường mới
exports.createRoute = async (req, res) => {
  try {
    const { tenTuyenDuong, loai } = req.body;

    if (!tenTuyenDuong) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu thông tin tên tuyến đường" });
    }

    const newRoute = await routeService.createRoute({ tenTuyenDuong, loai });
    res.status(201).json({ success: true, data: newRoute });
  } catch (error) {
    console.error("❌ Lỗi createRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật tuyến đường
exports.updateRoute = async (req, res) => {
  try {
    const { tenTuyenDuong, loai } = req.body;
    const updated = await routeService.updateRoute(req.params.id, {
      tenTuyenDuong,
      loai,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Lỗi updateRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Xóa tuyến đường
exports.deleteRoute = async (req, res) => {
  try {
    await routeService.deleteRoute(req.params.id);
    res.json({ success: true, message: "Xóa tuyến đường thành công" });
  } catch (error) {
    console.error("❌ Lỗi deleteRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Thêm trạm vào tuyến
exports.addStationToRoute = async (req, res) => {
  try {
    const { maDiemDung, thuTu, thoiGianDuKien, loaiDiem } = req.body;
    const result = await routeService.addStationToRoute(req.params.id, {
      maDiemDung,
      thuTu,
      thoiGianDuKien,
      loaiDiem,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Lỗi addStationToRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật trạm trong tuyến
exports.updateStationInRoute = async (req, res) => {
  try {
    const { thuTu, thoiGianDuKien, loaiDiem } = req.body;
    await routeService.updateStationInRoute(
      req.params.id,
      req.params.stationId,
      { thuTu, thoiGianDuKien, loaiDiem }
    );
    res.json({ success: true, message: "Cập nhật trạm thành công" });
  } catch (error) {
    console.error("❌ Lỗi updateStationInRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Xóa trạm khỏi tuyến
exports.removeStationFromRoute = async (req, res) => {
  try {
    await routeService.removeStationFromRoute(
      req.params.id,
      req.params.stationId
    );
    res.json({ success: true, message: "Xóa trạm khỏi tuyến thành công" });
  } catch (error) {
    console.error("❌ Lỗi removeStationFromRoute:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cập nhật thứ tự các trạm hàng loạt
exports.reorderStations = async (req, res) => {
  try {
    const { stations } = req.body; // Array of {maDiemDung, thuTu}

    if (!Array.isArray(stations) || stations.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu dữ liệu trạm" });
    }

    await routeService.reorderStations(req.params.id, stations);
    res.json({ success: true, message: "Cập nhật thứ tự trạm thành công" });
  } catch (error) {
    console.error("❌ Lỗi reorderStations:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addNewCoordinates = async (req, res) => {
  try {
    const { viDo, kinhDo } = req.body; // Nhận trực tiếp viDo, kinhDo
    const result = await routeService.addNewCoordinates({ viDo, kinhDo });

    res.json({
      success: true,
      message: "Thêm tọa độ mới thành công",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi addNewCoordinates:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Thêm tọa độ thất bại",
    });
  }
};

exports.addNewStation = async (req, res) => {
  try {
    const {
      tenDiemDung,
      moTa,
      viDo,
      kinhDo,
      trangThai,
      thuTu,
      thoiGianDuKien,
      loaiDiem,
    } = req.body;

    const stationData = {
      tenDiemDung,
      moTa,
      thuTu: thuTu || 0, // Thêm giá trị mặc định nếu cần
      thoiGianDuKien: thoiGianDuKien || "00:00:00",
      loaiDiem: loaiDiem || "trạm",
      trangThai: trangThai || 1,
    };

    const coordinates = { viDo, kinhDo };

    const result = await routeService.addNewStation(stationData, coordinates);

    res.json({
      success: true,
      message: "Thêm trạm mới thành công",
      data: result,
    });
  } catch (error) {
    console.error("❌ Lỗi addNewStation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Thêm trạm thất bại",
    });
  }
};
