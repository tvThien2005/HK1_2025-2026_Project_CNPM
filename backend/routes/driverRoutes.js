const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/", driverController.getDriver);
router.post("/", driverController.createDriver);
router.put("/:id", driverController.editDriver);
router.delete("/:id", driverController.removeDriver);

module.exports = router;
