const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getLandlordBookings,
  updateBookingStatus
} = require('../booking/bookingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// IMPORTANT: specific paths before parameterized paths
router.get('/my-bookings', authenticateToken, authorizeRole('tenant'), getMyBookings);
router.get('/landlord/bookings', authenticateToken, authorizeRole('landlord'), getLandlordBookings);

router.post('/', authenticateToken, authorizeRole('tenant'), createBooking);
router.patch('/:id/status', authenticateToken, authorizeRole('landlord'), updateBookingStatus);

module.exports = router;
