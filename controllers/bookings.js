const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const {
    checkInDate,
    checkOutDate,
    numberOfGuests,
    numberOfRooms,
    guestName,
    email,
    phone,
    specialRequest,
  } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Property not found!");
    return res.redirect("/listings");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    req.flash("error", "Please provide valid check-in and check-out dates.");
    return res.redirect(`/listings/${id}`);
  }

  if (checkIn < today) {
    req.flash("error", "Check-in date cannot be in the past.");
    return res.redirect(`/listings/${id}`);
  }

  if (checkOut <= checkIn) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listings/${id}`);
  }

  // Check Availability Overlap
  const existingOverlap = await Booking.findOne({
    listing: id,
    bookingStatus: { $ne: "Cancelled" },
    $or: [
      { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
    ],
  });

  if (existingOverlap) {
    req.flash(
      "error",
      "This property is not available for the selected dates. Please choose different dates."
    );
    return res.redirect(`/listings/${id}`);
  }

  // Calculate Nights & Amounts
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const pricePerNight = listing.price || 0;
  const roomsCount = parseInt(numberOfRooms) || 1;
  const subtotal = pricePerNight * numberOfNights * roomsCount;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + tax;

  // Generate Unique Booking ID
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const bookingId = `ST-${new Date().getFullYear()}-${randomNum}`;

  const newBooking = new Booking({
    bookingId,
    user: req.user._id,
    listing: listing._id,
    guestName: guestName || req.user.username,
    email: email || req.user.email,
    phone: phone || "",
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests: parseInt(numberOfGuests) || 1,
    numberOfRooms: roomsCount,
    specialRequest: specialRequest || "",
    numberOfNights,
    pricePerNight,
    subtotal,
    tax,
    totalAmount,
    bookingStatus: "Confirmed",
    paymentStatus: "Pending",
  });

  await newBooking.save();

  req.flash(
    "success",
    `Booking Confirmed! Booking ID: ${newBooking.bookingId}`
  );
  res.redirect(`/bookings/${newBooking._id}/confirmation`);
};

module.exports.renderConfirmation = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate("listing")
    .populate("user");

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/listings");
  }

  if (
    !booking.user.equals(req.user._id) &&
    req.user.role !== "admin"
  ) {
    req.flash("error", "Unauthorized access!");
    return res.redirect("/listings");
  }

  res.render("bookings/confirmation", { booking });
};

module.exports.index = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index", { bookings });
};

module.exports.show = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate("listing")
    .populate("user");

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  if (
    !booking.user.equals(req.user._id) &&
    req.user.role !== "admin"
  ) {
    req.flash("error", "Unauthorized access!");
    return res.redirect("/bookings");
  }

  res.render("bookings/show", { booking });
};

module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);

  if (!booking) {
    req.flash("error", "Booking not found!");
    return res.redirect("/bookings");
  }

  if (
    !booking.user.equals(req.user._id) &&
    req.user.role !== "admin"
  ) {
    req.flash("error", "Unauthorized access!");
    return res.redirect("/bookings");
  }

  if (booking.bookingStatus === "Cancelled") {
    req.flash("error", "This booking is already cancelled.");
    return res.redirect(`/bookings/${id}`);
  }

  booking.bookingStatus = "Cancelled";
  await booking.save();

  req.flash("success", "Booking has been cancelled successfully.");
  res.redirect(`/bookings/${id}`);
};
