const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/", driverController.getDriver);

// Debug middleware for POST
router.post(
  "/",
  (req, res, next) => {
    console.log("🛣️  POST /api/drivers called");
    console.log("📦 Headers:", req.headers);
    console.log("📦 Content-Type:", req.headers["content-type"]);
    next();
  },
  driverController.createDriver
);

router.put("/:id", driverController.editDriver);
router.delete("/:id", driverController.removeDriver);

module.exports = router;
