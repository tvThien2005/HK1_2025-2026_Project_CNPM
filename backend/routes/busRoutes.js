const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");

// KHÔNG sử dụng multer middleware
router.get("/", busController.getBuses);
router.get("/:id", busController.getBusById);
router.post("/", busController.createBus); // Không có multer
router.put("/:id", busController.editBus); // Không có multer
router.delete("/:id", busController.removeBus);
router.patch("/:id/block", busController.blockBus);
router.patch("/:id/unblock", busController.unblockBus);

module.exports = router;
