const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController = require("../controllers/admin");

// Apply admin authentication to all admin routes
router.use(isLoggedIn, isAdmin);

// Admin Dashboard
router.get("/", wrapAsync(adminController.dashboard));

// Admin Bookings Management
router.get("/bookings", wrapAsync(adminController.bookingsIndex));
router.post("/bookings/:id/status", wrapAsync(adminController.updateBookingStatus));

// Admin Users Management
router.get("/users", wrapAsync(adminController.usersIndex));
router.post("/users/:id/role", wrapAsync(adminController.updateUserRole));

// Admin Listings Management
router.get("/listings", wrapAsync(adminController.listingsIndex));

module.exports = router;
