const express = require("express");
const router = express.Router();
const assignRoute = require("../controllers/assignDriverController");

router.get("/", assignRoute.getAssign);
router.get("/drivers", assignRoute.getDriver);
router.get("/schedules", assignRoute.getSchedule);
router.get("/routes", assignRoute.getRoute);
router.post("/", assignRoute.createAssign);
router.put("/:id", assignRoute.editAssign);

router.delete("/:id", assignRoute.removeAssign);
module.exports = router;
