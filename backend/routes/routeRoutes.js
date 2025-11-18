const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const routeService = require("../services/routeService");
const db = require("../config/db");

router.get("/stations/all", async (req, res) => {
  try {
    console.log("📥 GET /api/routes/stations/all - Fetching all stations");

    const query = `
      SELECT 
        dd.maDiemDung,
        dd.tenDiemDung,
        dd.moTa,
        dd.trangThai,
        vt.viDo,
        vt.kinhDo
      FROM diemdung dd
      LEFT JOIN vitrithuc vt ON dd.maViTriThuc = vt.maViTriThuc
      WHERE dd.trangThai = 'Active'
      ORDER BY dd.tenDiemDung
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Lỗi get all stations:", err);
        res.status(500).json({
          success: false,
          error: err.message,
        });
      } else {
        console.log("✅ Fetched stations:", results.length);
        res.json(results);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Routes cơ bản cho tuyến đường
router.get("/", routeController.getAllRoutes);
router.get("/:id", routeController.getRouteById);
router.post("/", routeController.createRoute);
router.put("/:id", routeController.updateRoute);
router.delete("/:id", routeController.deleteRoute);

// Quản lý trạm trong tuyến đường
router.get("/:id/stations", routeController.getRouteStations);
router.post("/:id/stations", routeController.addStationToRoute);

// ✅ ĐẶT REORDER TRƯỚC updateStationInRoute
router.put("/:id/stations/reorder", async (req, res) => {
  try {
    const routeId = req.params.id;
    const { stations } = req.body;

    console.log("📥 BACKEND ROUTE - Reorder request:");
    console.log("  Route ID:", routeId);
    console.log("  Stations received:", JSON.stringify(stations, null, 2));

    if (!stations || !Array.isArray(stations)) {
      console.error("❌ Invalid stations data");
      return res.status(400).json({
        success: false,
        error: "Invalid stations data",
      });
    }

    console.log("🔄 Calling routeService.reorderStations...");
    const result = await routeService.reorderStations(routeId, stations);

    console.log("✅ BACKEND ROUTE - Service result:", result);

    // Verify data sau khi update
    const verifyQuery = `
      SELECT maDiemDung, thuTu 
      FROM chitiettuyenduong 
      WHERE maTuyenDuong = ? 
      ORDER BY thuTu
    `;

    db.query(verifyQuery, [routeId], (err, verifyResult) => {
      if (!err) {
        console.log("🔍 VERIFY - Data in DB after update:", verifyResult);
      }
    });

    res.json({
      success: true,
      message: "Cập nhật thứ tự trạm thành công",
      data: result,
    });
  } catch (error) {
    console.error("❌ BACKEND ROUTE - Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ ĐẶT SAU REORDER
router.put("/:id/stations/:stationId", routeController.updateStationInRoute);

router.delete(
  "/:id/stations/:stationId",
  routeController.removeStationFromRoute
);

// Routes mới cho tọa độ và trạm độc lập
router.post("/coordinates", routeController.addNewCoordinates);
router.post("/stations/new", routeController.addNewStation);

module.exports = router;
