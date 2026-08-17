const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingsController = require("../controllers/bookings");

// Create booking for a listing
router.post(
  "/listings/:id/bookings",
  isLoggedIn,
  wrapAsync(bookingsController.createBooking)
);

// My Bookings
router.get("/bookings", isLoggedIn, wrapAsync(bookingsController.index));

// Booking Confirmation Receipt
router.get(
  "/bookings/:id/confirmation",
  isLoggedIn,
  wrapAsync(bookingsController.renderConfirmation)
);

// Booking Details Page
router.get("/bookings/:id", isLoggedIn, wrapAsync(bookingsController.show));

// Cancel Booking
router.post(
  "/bookings/:id/cancel",
  isLoggedIn,
  wrapAsync(bookingsController.cancelBooking)
);

module.exports = router;
