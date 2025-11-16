const express = require("express");
const router = express.Router();
const notificationRoute = require("../controllers/notificationController");

// router.get("/", notificationRoute.getAssign);
router.get("/drivers", notificationRoute.getNotificationDriver);
router.get("/parents", notificationRoute.getNotificationParent);
router.get("/driver", notificationRoute.getAllDrivers);
router.get("/parent", notificationRoute.getAllParents);
router.post("/", notificationRoute.createNotification);
router.delete("/:id", notificationRoute.removeNotification);
module.exports = router;
