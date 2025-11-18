// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
// THÊM DÒNG NÀY - import function assignStudentToStation
// const { assignStudentToStation } = studentController;

// KHÔNG sử dụng multer middleware
router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.createStudent); // Không có multer
router.put("/:id", studentController.editStudent); // Không có multer
router.delete("/:id", studentController.removeStudent);
router.patch("/:id/block", studentController.blockStudent);
router.patch("/:id/unblock", studentController.unblockStudent);
// ...existing routes...
router.get("/:studentId/stations", studentController.getStudentStations);
// ...existing routes...

// ✅ ROUTE GÁN TRẠM - ĐƠN GIẢN
router.post("/assign-station", studentController.assignStudentToStation);

module.exports = router;
