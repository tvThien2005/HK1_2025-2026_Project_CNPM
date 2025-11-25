const express = require("express");
const router = express.Router();
const scheduledController = require("../controllers/scheduledController");

router.get("/", scheduledController.getScheduled);
router.post("/", scheduledController.createScheduled);
router.put("/:id", scheduledController.editScheduled);

module.exports = router;
