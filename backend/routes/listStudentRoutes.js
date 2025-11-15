const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect, isDriver } = require('../middleware/authMiddleware');

router.get('/lichtrinh', protect, isDriver, driverController.getLichTrinh);

module.exports = router;