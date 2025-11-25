const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

const { protect, isDriver } = require('../middleware/authMiddleware');

router.get('/trips/:tripId/students', protect, isDriver, driverController.getStudentsByTrip);
router.get('/trips/today', protect, isDriver, driverController.getLichTrinhTrongNgay); 
router.get('/info', protect, isDriver, driverController.getTaixeById);
router.get(`/infoAccount/:accountId`, protect, isDriver, driverController.getTaiKhoanById);
router.get(`/notification`,  protect, isDriver, driverController.getAllNotificationByIdAccount);
router.get(`/warning`,  protect, isDriver, driverController.getAllWarningByIdDriver);
router.get(`/allparent`,  protect, isDriver, driverController.getAllParent);
router.post(`/postwarning`,  protect, isDriver, driverController.sendWarning);
router.post(`/changeinfodriver`,  protect, isDriver, driverController.sendInfoDriver);
router.get('/students/stats', protect, isDriver, driverController.getStudentStatsForActiveTrip);
router.post('/trips/:tripId/students/:maHocSinh/status', protect, isDriver, driverController.updateStudentStatus);
router.get('/lichtrinh', protect, isDriver, driverController.getLichTrinh);
router.post('/trips/start-scheduled', protect, isDriver, driverController.startScheduledTrips);
module.exports = router;